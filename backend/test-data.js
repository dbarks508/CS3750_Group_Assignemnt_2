require("dotenv").config({ path: "./config.env" });
const dbo = require("./db/conn");

const BACKEND = "http://localhost:4000";

const PASSWORD = "Password123!";
const USERNAMES = [
	"bob",
	"alice",
	"john",
	"mary",
	"jane",
	"tim",
];

// modify these for your testing needs
const TRANSACION_COUNT = () => rng(50, 200);
const WITHDRAW_AMOUNT = (curBal) => rng(curBal * 0.1, curBal * 0.9) * -1;
const DEPOSIT_AMOUNT = () => rng(1_000, 20_000);

const ACTIONS = [
	"deposit",
	"withdraw",
	// "transfer",
];

const CATEGORIES = [
	"food",
	"entertainment",
	"transport",
	"rent",
	"other",
];

const PRESENT = new Date().getTime();


let userCol;
let logCol;

// inclusive!
function rng(min, max){
	if(max === undefined){
		max = min;
		min = 0;
	}
	
	return Math.round(Math.random() * (max - min) + min);
}
function pick(arr){
	return arr[rng(arr.length - 1)];
}
function partionRange(start, end, count){
	let out = [];
	let cur = start;
	while(cur <= end){
		out.push(+(cur.toFixed(6)));

		cur += (end - start) / (count - 1);
	}

	// floating point edge case
	if(out.length < count) out.push(end);

	return out;
}
function partionRangeInterval(start, end, count){
	let offset = (end - start) / count;

	let lhs = partionRange(start, end - offset, count);
	let rhs = partionRange(start + offset, end, count);

	let out = lhs.map((left, idx) => [left, rhs[idx]]);

	return out;
}
function randDate(cur, total){
	let past = new Date(PRESENT);
	past.setFullYear(past.getUTCFullYear() - 10);

	let time = rng(...(partionRangeInterval(past.getTime(), PRESENT, total)[cur]));

	return new Date(time);
}

async function getBalance(accountNumber, accountIndex){
	return (await logCol.aggregate([{$match: {accountNumber, accountIndex}}, {$group: {_id: "$accountNumber", "amount": {$sum: "$amount"}}}]).toArray())?.pop()?.amount ?? 0;
}
async function updateBalance(accountNumber){
	const help = async accountIndex => {
		let bal = await getBalance(accountNumber, accountIndex);

		await userCol.updateOne({accountNumber}, {$set: {[`accounts.${accountIndex}.balance`]: bal}});
	};

	await Promise.all([0, 1, 2].map(help));
}
async function genTransaction(accountNumber, cur, total){
	let category = pick(CATEGORIES);
	let action = pick(ACTIONS);
	let index = rng(0, 2);

	let amount = DEPOSIT_AMOUNT();
	if(action === "withdraw"){
		let balance = await getBalance(accountNumber, index);
		if(balance < 10){
			action = "deposit";
		}else{
			amount = WITHDRAW_AMOUNT(balance);
		}
	}

	await logCol.insertOne({
		accountNumber,
		accountIndex: index,
		action,
		amount,
		category,
		date: randDate(cur, total),
	});
}
async function addUser(username, password){
	let res = await fetch(`${BACKEND}/register`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({username, password})});
	let data = await res.json();

	if(!res.ok){
		console.log("error when creating user:", data);
		process.exit();
	}

	return data.accountNumber;
}



(async () => {
	await dbo.connectToServer();
	let db = dbo.getDB();

	userCol = db.collection("users");
	logCol = db.collection("transactions");

	if(process.env.DELETE_MY_DATA){
		console.log("deleting the database...");

		// give the user a small window to cancel the deletion
		await new Promise(r => setTimeout(() => r(), 500));

		await db.dropDatabase();
	}

	console.log("creating users...");
	let accounts = await Promise.all(USERNAMES.map(async name => addUser(name, PASSWORD)));

	console.log("creating transactions...");
	await Promise.all(accounts.map(async (account) => {
		let count = TRANSACION_COUNT();
		for(let i = 0; i < count; i++){
			await genTransaction(account, i, count);
		}
		await updateBalance(account);
	}));

	console.log("finished!");

	process.exit();
})();
