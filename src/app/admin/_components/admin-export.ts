type ExcelCellValue = string | number | boolean | null | undefined;

export type ExcelColumn<T> = {
  header: string;
  value: (row: T) => ExcelCellValue;
};

type ExportRowsToExcelOptions<T> = {
  fileName: string;
  sheetName: string;
  columns: ExcelColumn<T>[];
  rows: T[];
};

function escapeXml(value: ExcelCellValue) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cellType(value: ExcelCellValue) {
  return typeof value === "number" ? "Number" : "String";
}

function buildCell(value: ExcelCellValue) {
  return `<Cell><Data ss:Type="${cellType(value)}">${escapeXml(value)}</Data></Cell>`;
}

export async function exportRowsToExcel<T>({
  fileName,
  sheetName,
  columns,
  rows,
}: ExportRowsToExcelOptions<T>) {
  if (typeof document === "undefined") {
    return;
  }

  // Try to use SheetJS (xlsx) when available to produce a real .xlsx file
  try {
    // Dynamic import so we don't force the dependency if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const XLSX = (await import('xlsx')).default || (await import('xlsx'));

    const aoa: (string | number | boolean | null)[][] = [];
    // header
    aoa.push(columns.map((c) => String(c.header)));
    // rows
    for (const row of rows) {
      aoa.push(columns.map((c) => {
        const v = c.value(row);
        return v === undefined ? null : (typeof v === 'number' || typeof v === 'boolean' ? v : String(v ?? ''));
      }));
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Sheet1');
    const wopts = { bookType: 'xlsx', type: 'array' } as any;
    const wbout = XLSX.write(wb, wopts);

    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return;
  } catch (e) {
    // Fall back to old XML .xls export if xlsx lib is not available
  }

  // Fallback legacy XML-based .xls export
  const headerRow = columns
    .map((column) => buildCell(column.header))
    .join("");

  const bodyRows = rows
    .map((row) =>
      columns
        .map((column) => buildCell(column.value(row)))
        .join(""),
    )
    .map((cells) => `<Row>${cells}</Row>`)
    .join("");

  const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table>
   <Row>${headerRow}</Row>
   ${bodyRows}
  </Table>
 </Worksheet>
</Workbook>`;

  // Prepend UTF-8 BOM to help Excel correctly detect UTF-8 encoded XML
  const bom = '\uFEFF';
  const blob = new Blob([bom, workbook], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${fileName}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
