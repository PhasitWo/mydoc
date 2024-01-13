// test
async function test() {
    let input = {
        checker1: "HELLO FROM FASTAPI",
    };
    let path = "C:/Users/PhasitWo/Desktop/Folders/ElectronProject/mydoc/xlsx/หจก New Procurement Form.xlsx";
    let keyword = { checker1: { key: "CHECKER1", default: "" } };


    const response = await fetch("http://127.0.0.1:8000/write_form/", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            path: "C:/Users/PhasitWo/Desktop/Folders/ElectronProject/mydoc/xlsx/หจก New Procurement Form.xlsx",
            input: { checker1: "HELLO FROM FASTAPI" },
            keyword: { checker1: { key: "CHECKER1", default: "" } },
        }),
    });
    const out = await response.json();
    console.log(out);
}

test();
