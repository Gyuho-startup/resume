# Testing the Token-Based Payment Gate

## ✅ Unit Tests: PASSED
All payment gate calculations are working correctly:
- Turn 1 (1K input, 500 output) → $0.0205 → ✅ Triggers gate
- Turn 1 (800 input, 200 output) → $0.0054 → ✅ Does not trigger
- Turn 2 cumulative (600+300 on top of $0.0054) → $0.0217 → ✅ Triggers gate

## 🌐 End-to-End Testing Guide

### Prerequisites
- ✅ Dev server running on http://localhost:3000
- ✅ Migration applied
- ✅ ANTHROPIC_API_KEY configured in .env.local

### Test Scenario 1: Single Turn Trigger (High Token Usage)

**Goal**: Verify payment gate triggers on first turn if cost >= $0.02

**Steps**:
1. Open http://localhost:3000/coach
2. Start a new conversation (voice or text mode)
3. Give a **detailed, lengthy response** to the first question (e.g., describe your background in 3-4 paragraphs)
4. Wait for AI response

**Expected Result**:
- Payment gate modal should appear
- Modal shows resume preview with blur effects
- Check browser console for log: `[/api/coach] Payment gate triggered at $0.XXXX`

**Why it triggers**: Lengthy responses generate ~1000-2000 tokens, costing ~$0.02-0.02

---

### Test Scenario 2: Cumulative Trigger (Multiple Turns)

**Goal**: Verify payment gate triggers after multiple smaller turns

**Steps**:
1. Open http://localhost:3000/coach
2. Start a new conversation
3. Give **short responses** to each question (1-2 sentences)
4. Continue through 2-3 turns
5. Monitor cumulative cost in console logs

**Expected Result**:
- First few turns: No payment gate
- Console shows: `[/api/coach] Cumulative cost check: { existingCost: 0.00XX, ... }`
- After 2-3 turns: Payment gate appears when cumulative >= $0.02

**Why it triggers**: Each short turn costs ~$0.004-0.006, accumulates to $0.02+

---

### Test Scenario 3: Paid User (Should NOT Trigger)

**Goal**: Verify paid users bypass payment gate

**Steps**:
1. Find a session ID from database where `payment_status = 'paid'`
2. Or manually update a session:
   ```sql
   UPDATE conversation_sessions
   SET payment_status = 'paid'
   WHERE id = 'your-session-id';
   ```
3. Continue conversation with that session
4. Use lengthy responses to accumulate high token cost

**Expected Result**:
- Payment gate should NEVER appear
- Console shows: `[/api/coach] Cumulative cost check: { ... paymentStatus: 'paid' }`
- Conversation continues indefinitely

---

### Test Scenario 4: Token Usage Persistence

**Goal**: Verify token usage is saved and accumulated correctly

**Steps**:
1. Start conversation, trigger payment gate
2. Close payment modal (click "Not now")
3. Send another message
4. Check database:
   ```sql
   SELECT
     id,
     token_usage->>'input' as input_tokens,
     token_usage->>'output' as output_tokens,
     token_usage->>'cost_usd' as cost
   FROM conversation_sessions
   ORDER BY created_at DESC
   LIMIT 1;
   ```

**Expected Result**:
- Each turn adds to cumulative token_usage
- `cost_usd` increases with each API call
- Values persist in database

---

## 🔍 Monitoring & Debugging

### Browser Console
Look for these logs:
```
[/api/coach] Token usage: { input: 1234, output: 567, cost_usd: "0.0123" }
[/api/coach] Cumulative cost check: { existingCost: 0.0054, thisTurnCost: 0.0069, cumulativeCost: 0.0123, paymentStatus: 'free' }
[/api/coach] Payment gate triggered at $0.0223
```

### Network Tab
1. Open DevTools → Network
2. Find `/api/coach` request
3. Check SSE response for `paymentGate: true`

### Database Inspection
```sql
-- View all sessions with token usage
SELECT
  id,
  payment_status,
  token_usage->>'cost_usd' as cost,
  created_at
FROM conversation_sessions
ORDER BY created_at DESC;

-- Find sessions near threshold
SELECT
  id,
  CAST(token_usage->>'cost_usd' AS numeric) as cost
FROM conversation_sessions
WHERE CAST(token_usage->>'cost_usd' AS numeric) BETWEEN 0.008 AND 0.012;
```

---

## 🐛 Troubleshooting

### Payment Gate Not Appearing

**Check**:
1. Browser console for errors
2. `payment_status` is 'free' (not 'paid')
3. Token usage is being saved:
   ```sql
   SELECT token_usage FROM conversation_sessions WHERE id = 'your-session-id';
   ```
4. ANTHROPIC_API_KEY is valid

**Common Issues**:
- Session fetch failing → Check API route logs
- Token usage not accumulating → Check PATCH implementation
- Cost calculation wrong → Verify pricing constants ($3/M, $15/M)

### Payment Gate Appearing Too Early/Late

**Check**:
1. Token counts in console logs
2. Cost calculation: `(input/1M)*3 + (output/1M)*15`
3. Threshold is exactly `>= 0.01` (not 0.1 or 1.0)

### Modal Not Showing Resume Preview

**Check**:
1. `resumeData` prop passed to `PaymentGateResumePreview`
2. Console for errors in preview component
3. Verify blur configuration in `resume-preview-formatter.ts`

---

## ✅ Success Criteria

Payment gate implementation is successful when:

- [ ] Payment gate appears when cumulative cost >= $0.02
- [ ] Payment gate does NOT appear for paid users
- [ ] Token usage persists in database correctly
- [ ] Cumulative cost accumulates across turns
- [ ] Resume preview shows with blur effects
- [ ] Console logs show accurate token counts and costs
- [ ] Conversation can continue after payment (when implemented)

---

## 📊 Expected Token Counts

### Typical Conversation Patterns

| Scenario | Input Tokens | Output Tokens | Cost | Triggers? |
|----------|-------------|---------------|------|-----------|
| Short Q&A | 500-800 | 200-400 | $0.004-0.008 | No |
| Medium conversation | 1000-1500 | 500-800 | $0.009-0.016 | Usually |
| Long detailed response | 2000-3000 | 1000-1500 | $0.021-0.031 | Yes |
| 3 short turns cumulative | ~1500 | ~600 | $0.023 | Yes |

---

## 🚀 Next Steps After Testing

Once payment gate is verified:
1. Implement Stripe checkout flow
2. Update session `payment_status` after successful payment
3. Test full paid user experience
4. Add analytics for payment gate conversion rate
5. Monitor token costs in production

---

**Last Updated**: 2026-02-16
**Status**: Ready for testing
