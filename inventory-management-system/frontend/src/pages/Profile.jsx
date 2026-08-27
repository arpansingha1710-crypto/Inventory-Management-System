import React, { useEffect, useState } from "react";
import api from "../api";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";

export default function Profile({ onUserChange }) {
  const [form,setForm]=useState({name:"",email:"",phone:"",password:""});
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{
    api.get("/profile").then(r=>setForm({...r.data,password:""})).catch(e=>setError(e.response?.data?.message||"Could not load profile")).finally(()=>setLoading(false));
  },[]);

  async function save(e) {
    e.preventDefault(); setMessage(""); setError("");
    try {
      const payload={name:form.name,phone:form.phone};
      if(form.password) payload.password=form.password;
      const {data}=await api.put("/profile",payload);
      setForm({...data,password:""});
      onUserChange?.(data);
      setMessage("Profile updated.");
    } catch(e) { setError(e.response?.data?.message||"Could not update profile"); }
  }

  if(loading) return <Loader/>;

  return <div>
    <div className="page-heading"><div><h2>Profile</h2><p>Manage your account details.</p></div></div>
    <div className="panel profile-panel">
      <ErrorMessage message={error}/>
      {message&&<div className="success-box">{message}</div>}
      <form className="form" onSubmit={save}>
        <label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label>Email<input disabled value={form.email}/></label>
        <label>Phone<input value={form.phone||""} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
        <label>New Password<input type="password" placeholder="Leave blank to keep current password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
        <button className="primary-button">Save Changes</button>
      </form>
    </div>
  </div>
}
