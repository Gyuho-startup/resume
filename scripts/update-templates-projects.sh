#!/bin/bash

# Script to update all templates to render project.highlights as bullets
# This is a critical HR-quality improvement

TEMPLATES_DIR="components/templates"

echo "🔄 Updating all templates to use project.highlights..."
echo ""

# Find all template files except EducationFirstTemplate (already updated)
find "$TEMPLATES_DIR" -name "*Template.tsx" ! -name "EducationFirstTemplate.tsx" | while read -r file; do
  echo "Processing: $file"

  # Check if file contains the old pattern
  if grep -q "project.description" "$file"; then
    # Create backup
    cp "$file" "$file.bak"

    # The sed replacement is complex, so we'll use a simpler approach:
    # We'll mark the files that need manual updating
    echo "  ⚠️  Contains project.description - needs manual update"
  else
    echo "  ✅ Already updated or no projects section"
  fi
done

echo ""
echo "📋 Summary:"
echo "Templates that need manual updating have been identified."
echo "Backups created with .bak extension."
echo ""
echo "Next: Apply updates to each template individually."
