let dic = {
    boy: "소년",
    girl: "소녀",
    friend: "친구"
};

delete dic.girl;
dic.apple = "사과";
dic.ten = 10;
console.log(dic.girl); // undefined
console.log(dic.apple); // 사과
console.log(dic.ten); // 10