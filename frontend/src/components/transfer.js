import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function Transfer() {
    // transfer page states
    const [srcAccount, setSrcAccount] = useState(null);
    const [dstAccount, setDstAccount] = useState(null);
    const [amount, setAmount] = useState(null);
    const [srcUserID, setSrcUserID] = useState(null);
    const [dstUserID, setDstUserID] = useState(null);
    const [category, setCategory] = useState(null);
    const [message, setMessage] = useState("");
    const [form, setForm] = useState({
        dstUserID: "",
        srcAccount: "0",
        dstAccount: "0",
        category: "",
        amount: "",
    });
    const navigate = useNavigate();

    // useEffect to verify session
    useEffect(() => {
        async function run() {
        const response = await fetch(`http://localhost:4000/verify`, {
            method: "GET",
            credentials: "include",
        });

        const data = await response.json();

        if (data.status === "no session set") {
            navigate("/");
        } else {
            setSrcUserID(data.accountNumber); // assuming the returned user has an account number that is equal to a userID
        }
        }
        run();
        return;
    }, []);


    // helpr function to update form on change
    function updateForm(jsonObj) {
        return setForm((prevJsonObj) => {
            return { ...prevJsonObj, ...jsonObj };
        });
    }

    // handle form submission
    async function onTransfer(e){
        e.preventDefault();

        console.log("initiating transfer...");

        // create the transfer json obj
        const transfer = {
            dstAccountNumber: form.dstUserID,
            srcAccountIndex: form.srcAccount,
            dstAccountIndex: form.dstAccount,
            category: form.category,
            amount: form.amount,
        };

        console.log(transfer);

        const res = await fetch(`http://localhost:4000/transfer`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transfer),
        });

        // get the data from res
        const data = await res.json();
        // handle success or failure of transfer
        if (data.message === "transfer successful") {
            console.log("transfer completed");
            setMessage(data.message);
        }
        else {
            console.log("transfer failed");
            setMessage(data.message);
            alert(data.message); // alert user on failure
        }
    }

return (
    <div className="main">
        <h2>Transfer Funds:</h2>
        <br/>

        <div className="container">
            <form onSubmit={onTransfer}>
                <div>
                    <label>Destination Account Number: </label>
                    <input
                    type="text"
                    id="dstUserID"
                    value={form.dstUserID}
                    onChange={(e) => updateForm({ dstUserID: e.target.value })}
                    required
                    />
                </div>

                <div>
                    <label>Source Account Choice: </label>
                    <select
                    name="srcAccount"
                    id="srcAccount"
                    value={form.srcAccount}
                    onChange={(e) => updateForm({ srcAccount: e.target.value })}
                    required>
                    <option value={0} >Savings</option>
                    <option value={1} >Checking</option>
                    <option value={2} >Other</option>
                    </select>
                </div>

                <div>
                    <label>Destination Account Choice: </label>
                    <select
                    name="dstAccount"
                    id="dstAccount"
                    value={form.dstAccount}
                    onChange={(e) => updateForm({ dstAccount: e.target.value })}
                    required>
                    <option value={0} >Savings</option>
                    <option value={1} >Checking</option>
                    <option value={2} >Other</option>
                    </select>
                </div>

                <div>
                    <label>Category: </label>
                    <input
                    type="text"
                    id="catagory"
                    value={form.category}
                    onChange={(e) => updateForm({ category: e.target.value })}
                    required
                    />
                </div>

                <div>
                    <label>Amount: </label>
                    <input
                    type="number"
                    id="amount"
                    value={form.amount}
                    onChange={(e) => updateForm({ amount: e.target.value })}
                    required
                    />
                </div>

                <input type="submit" value="Transfer"></input>

            </form>
            <div>
                <button onClick={() => navigate("/home")}>Back to Home</button>
            </div>
        </div>


        
    </div>
)
}