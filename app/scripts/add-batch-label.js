const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/rnd/directory/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add batchLabel to formData initial state if not already there
if (!content.includes('batchLabel: ""')) {
    content = content.replace(
        /const \[formData, setFormData\] = useState\(\{\s*projectId: "",\s*itemName: "",/,
        `const [formData, setFormData] = useState({
    projectId: "",
    batchLabel: "",
    itemName: "",`
    );
    console.log('✅ Added batchLabel to formData initial state');
}

// Add Batch Revision field after itemName field in the form
const itemNameFieldPattern = /(<div>\s*<label className="text-xs font-medium">Category \(Item Name\)<\/label>\s*<input[^>]*value=\{formData\.itemName\}[^>]*\/>\s*<\/div>)/;

if (!content.includes('Batch Revision (Date)')) {
    const batchFieldHTML = `$1

              <div>
                <label className="text-xs font-medium">Batch Revision (Date)</label>
                <input
                  type="text"
                  className="w-full p-1.5 text-sm border rounded"
                  placeholder="e.g. 4 dec 2025"
                  value={formData.batchLabel || ""}
                  onChange={(e) => handleChange("batchLabel", e.target.value)}
                />
              </div>`;

    content = content.replace(itemNameFieldPattern, batchFieldHTML);
    console.log('✅ Added Batch Revision field to form');
} else {
    console.log('ℹ️  Batch Revision field already exists in form');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully updated directory/page.tsx');
