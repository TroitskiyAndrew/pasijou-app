export function getElementHeight(selector: string): number {
  const element = document.querySelector(selector) as HTMLElement;
  return element.offsetHeight;
}

export function correctPhoneNumber(phone: string) {
  return phone.replace(/^\+7/, '+1');
}

const tableIdsMap: Record<string, string> = {
  "1": "36",
  "2": "37",
  "3": "38",
  "4": "39",
  "5": "40",
  "6": "41",
  "7": "42",
  "8": "43",
  "9": "44",
  "10": "45",
  "11": "46",
  "12": "47",
  "13": "48",
  "14": "49",
  "15": "50",
  "21": "12",
  "22": "23",
  "23": "14",
  "24": "15",
  "25": "16",
  "26": "17",
  "27": "19",
  "28": "21",
  "29": "20",
  "30 sofa": "34",
  "31": "24",
  "32": "25",
  "33": "26",
  "34": "27",
  "35": "28",
  "36": "30",
  "37": "31",
  "38": "32",
  "=": "22",
  "KITCHEN": "29",
  "admin": "51",
  "pingping": "33",
  "Бар": "9",
}

export function mapTableId(tableNum: string): string {
  const tableId = tableIdsMap[tableNum];
  console.log(tableId)
  return tableId;
}
