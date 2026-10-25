export type BankBranch = { branch: string; ifsc: string };

export const bankOptions: string[] = [
  "Arunachal Pradesh Rural Bank",
  "Arunachal Pradesh State Co-operative Apex Bank",
  "Assam Gramin Vikash Bank",
  "North East Small Finance Bank",
  "State Bank of India",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Indian Bank",
  "Bank of India",
  "Central Bank of India",
  "Indian Overseas Bank",
  "UCO Bank",
  "Bank of Maharashtra",
  "Punjab & Sind Bank",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "YES Bank",
  "IDFC First Bank",
  "Federal Bank",
  "South Indian Bank",
  "Karnataka Bank",
  "Karur Vysya Bank",
  "City Union Bank",
  "Tamilnad Mercantile Bank",
  "Dhanlaxmi Bank",
  "Bandhan Bank",
  "Jana Small Finance Bank",
  "Ujjivan Small Finance Bank",
  "Equitas Small Finance Bank",
  "AU Small Finance Bank",
  "Suryoday Small Finance Bank",
  "ESAF Small Finance Bank",
  "Shivalik Small Finance Bank",
  "Unity Small Finance Bank",
  "India Post Payments Bank",
  "Airtel Payments Bank",
  "Paytm Payments Bank",
];

export const bankBranches: Record<string, BankBranch[]> = {
  "Arunachal Pradesh State Co-operative Apex Bank": [
    { branch: "Naharlagun", ifsc: "YESB0ARCB01" },
    { branch: "Itanagar", ifsc: "YESB0ARCB01" },
    { branch: "Nirjuli", ifsc: "YESB0ARCB01" },
    { branch: "Roing", ifsc: "YESB0ARCB01" },
    { branch: "Miao", ifsc: "YESB0ARCB01" },
    { branch: "Ziro", ifsc: "YESB0ARCB01" },
    { branch: "Pasighat", ifsc: "YESB0ARCB01" },
    { branch: "Namsai", ifsc: "YESB0ARCB01" },
    { branch: "Bordumsa", ifsc: "YESB0ARCB01" },
    { branch: "Bomdila", ifsc: "YESB0ARCB01" },
    { branch: "Hapoli", ifsc: "YESB0ARCB01" },
    { branch: "Tezu", ifsc: "YESB0ARCB01" },
    { branch: "Doimukh", ifsc: "YESB0ARCB01" },
    { branch: "Seppa", ifsc: "YESB0ARCB01" },
    { branch: "Deomali", ifsc: "YESB0ARCB01" },
    { branch: "Anini", ifsc: "YESB0ARCB01" },
    { branch: "Tawang", ifsc: "YESB0ARCB01" },
    { branch: "Daporijo", ifsc: "YESB0ARCB01" },
    { branch: "Mahadevpur", ifsc: "YESB0ARCB01" },
    { branch: "Sangram", ifsc: "YESB0ARCB01" },
    { branch: "Basar", ifsc: "YESB0ARCB01" },
    { branch: "Khonsa", ifsc: "YESB0ARCB01" },
    { branch: "Jengging", ifsc: "YESB0ARCB01" },
    { branch: "Ganga", ifsc: "YESB0ARCB01" },
    { branch: "Tuting", ifsc: "YESB0ARCB01" },
    { branch: "Yingkiong", ifsc: "YESB0ARCB01" },
    { branch: "Changlang", ifsc: "YESB0ARCB01" },
    { branch: "Jang", ifsc: "YESB0ARCB01" },
    { branch: "Mechuka", ifsc: "YESB0ARCB01" },
    { branch: "Dambuk", ifsc: "YESB0ARCB01" },
    { branch: "Chimpu", ifsc: "YESB0ARCB01" },
    { branch: "Tirbin", ifsc: "YESB0ARCB01" },
    { branch: "Balijan", ifsc: "YESB0ARCB01" },
    { branch: "Women Branch", ifsc: "YESB0ARCB01" },
  ],
  "State Bank of India": [
    { branch: "Naharlagun", ifsc: "SBIN0003232" },
    { branch: "Pasighat", ifsc: "SBIN0001395" },
    { branch: "Pasighat Bazar", ifsc: "SBIN0017667" },
    { branch: "RACC Pasighat", ifsc: "SBIN0063266" },
    { branch: "Regional Business Office Itanagar", ifsc: "SBIN0009151" },
  ],
  "Punjab National Bank": [
    { branch: "Itanagar", ifsc: "PUNB0143120" },
    { branch: "Itanagar Distt Papum Pare", ifsc: "PUNB0150310" },
    { branch: "Itanagar Secretariat", ifsc: "PUNB0206520" },
  ],
  "Central Bank of India": [
    { branch: "Naharlagun", ifsc: "CBIN0283233" },
  ],
  "HDFC Bank": [
    { branch: "Itanagar", ifsc: "HDFC0001643" },
    { branch: "Naharlagun", ifsc: "HDFC0004313" },
  ],
  "ICICI Bank": [
    { branch: "Itanagar", ifsc: "ICIC0000706" },
  ],
  "Bank of India": [
    { branch: "Itanagar", ifsc: "BKID0005045" },
    { branch: "Naharlagun", ifsc: "BKID0005046" },
  ],
};

export function findBranch(bankName: string, branch: string): BankBranch | undefined {
  const list = bankBranches[bankName] || [];
  const q = branch.trim().toLowerCase();
  if (!q) return undefined;
  return list.find((b) => b.branch.toLowerCase() === q);
}

export function searchBranches(bankName: string, query: string): BankBranch[] {
  const list = bankBranches[bankName] || [];
  const q = query.trim().toLowerCase();
  if (!q) return list.slice(0, 8);
  return list.filter((b) => b.branch.toLowerCase().includes(q)).slice(0, 8);
}