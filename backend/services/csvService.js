const { Parser } = require('json2csv');
const { withPriority } = require('../utils/priorityCalculator');

const CSV_FIELDS = [
  { label: 'ID', value: '_id' },
  { label: 'Title', value: 'title' },
  { label: 'Category', value: 'category' },
  { label: 'Area', value: 'area' },
  { label: 'Status', value: 'status' },
  { label: 'Priority', value: 'priority' },
  { label: 'Upvotes', value: 'upvotes' },
  { label: 'Filed By', value: 'filedBy' },
  { label: 'Filed On', value: 'filedOn' },
  { label: 'Last Updated', value: 'lastUpdated' },
  { label: 'Officer Remark', value: 'officerRemark' },
];

/**
 * Converts an array of populated Complaint documents into a CSV string
 * matching the exact column spec required by the officer export feature.
 */
function complaintsToCsv(complaints) {
  const rows = complaints.map((doc) => {
    const c = withPriority(doc);
    return {
      _id: c._id.toString(),
      title: c.title,
      category: c.category,
      area: c.area,
      status: c.status,
      priority: c.priority,
      upvotes: c.upvotes,
      filedBy: c.createdBy?.name || 'Unknown',
      filedOn: new Date(c.createdAt).toISOString(),
      lastUpdated: new Date(c.updatedAt).toISOString(),
      officerRemark: c.officerRemark || '',
    };
  });

  const parser = new Parser({ fields: CSV_FIELDS });
  return parser.parse(rows);
}

function exportFilename() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `complaints_export_${date}.csv`;
}

module.exports = { complaintsToCsv, exportFilename };
