
const getWorkingDaysInRange = (start, end) => {
    let count = 0;
    const curDate = new Date(start.getTime());
    while (curDate <= end) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 5) { // 5 is Friday
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

const test = () => {
    // Test 1: One week (Sun to Sat)
    // Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
    // Range: 7 days. Expected working days: 6 (skip Fri)
    const start1 = new Date("2024-02-04T00:00:00Z"); // Sunday
    const end1 = new Date("2024-02-10T00:00:00Z");   // Saturday
    const result1 = getWorkingDaysInRange(start1, end1);
    console.log(`Test 1 (Sun-Sat): Expected 6, Got ${result1}`);

    // Test 2: Friday only
    const start2 = new Date("2024-02-09T00:00:00Z"); // Friday
    const end2 = new Date("2024-02-09T00:00:00Z");   // Friday
    const result2 = getWorkingDaysInRange(start2, end2);
    console.log(`Test 2 (Fri only): Expected 0, Got ${result2}`);

    // Test 3: Thu to Sat (Thu, Fri, Sat) -> Expected 2
    const start3 = new Date("2024-02-08T00:00:00Z"); // Thursday
    const end3 = new Date("2024-02-10T00:00:00Z");   // Saturday
    const result3 = getWorkingDaysInRange(start3, end3);
    console.log(`Test 3 (Thu-Sat): Expected 2, Got ${result3}`);

    // Test 4: Two weeks (Sun to Sat next week) -> 14 days total -> 12 working days
    const start4 = new Date("2024-02-04T00:00:00Z");
    const end4 = new Date("2024-02-17T00:00:00Z");
    const result4 = getWorkingDaysInRange(start4, end4);
    console.log(`Test 4 (2 Weeks): Expected 12, Got ${result4}`);
}

test();
