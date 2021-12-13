var l = [4.35, 3.36, 1.4, 2.3, 5.2, 3.7, 18.5, 19.2, 25.4, 24.2, 25.7, 26.9, 19.1, 21.5, 18.5,2.7, 19.4, 1.3, 19.4, 2.6]

var sum = 0;
for(var i = 0; i < l.length; i++){
    sum += l[i];
}

var m = sum/l.length;
console.log("Resultat mitjana")
console.log(m)

var sum2 = 0;

for(var j = 0; j < l.length; j++){
    var s = l[j] - m;
    sum2 += Math.pow( s, 2);
}

var d = Math.sqrt(sum2/l.length);
console.log("Resultat Desviació")
console.log(d)



