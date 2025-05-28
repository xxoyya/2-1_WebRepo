const unit = {
    attack: function (weapon) {
        return `${weapon}으로 공격합니다.`;  // 백틱으로 수정
    }
}

console.log(unit.attack("주먹")); // 주먹으로 공격합니다.
console.log(unit.attack("총"));   // 총으로 공격합니다.