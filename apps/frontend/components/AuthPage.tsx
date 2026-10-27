"use client"
export function AuthPage ({isSignin}: {isSignin : boolean}){
    return <div className="w-screen h-screen h-screen flex justify-center items-center">
        <div className="p-2 m-2 bg-white rounded">
            <div>
                <input type="text" placeholder="Email" />
            </div>
            <div>
                <input type="password" placeholder="password" />
            </div>
            <div>
                <button>{isSignin? "Sign In" : "Sign Up"}</button>
            </div>
        </div>
    </div>
}