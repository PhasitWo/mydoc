function test() {
    throw Error("Hi");
}

function outer() {
    try {
        test();
    } catch (err) {
        throw Error("new Error", {cause:err});
    }
}

try {
    outer();
} catch (err) {
    console.log(err);
}
