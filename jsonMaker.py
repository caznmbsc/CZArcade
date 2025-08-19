from openpyxl import load_workbook
import json
import requests
from io import BytesIO

print("Retrieving XLSX...")
sheetsLink = "https://docs.google.com/spreadsheets/d/1Hnb113j20olLsh-SR5zFUsQNV95BMmeXmQOkATtgleI/export?format=xlsx"
response = requests.get(sheetsLink)
attempts = 0
while response.status_code != 200:
    attempts += 1
    if attempts >= 10:
        print("Too many Fails. Terminating.")
        exit(1)
    print("Code: " + str(response.status_code) + ". Failed to Download Google Sheets File. Retrying...")
    response = requests.get(sheetsLink)
currentWorkbook = load_workbook(filename=BytesIO(response.content), data_only=True)
print("Downloaded Google Sheets File.\n") 

data = {}
for sheetName in currentWorkbook.sheetnames:
    sheet = currentWorkbook[sheetName]
    sheetData = []
    for row in sheet.iter_rows(min_row=1, values_only=False):
        rowData = {}
        for cell in row:
            value = cell.value
            if cell.hyperlink:
                value = {"text": value, "hyperlink": cell.hyperlink.target}
            rowData[cell.column_letter] = value
        sheetData.append(rowData)
    data[sheetName] = sheetData

with open("CZARCADE.json", "w", encoding="utf-8") as jsonFile:
    json.dump(data, jsonFile, ensure_ascii=False, indent=2)
print("JSON Created.")