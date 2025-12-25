"use client";
import {useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import axios from "axios";
export default function ProjectDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const {id} = params;
    useEffect(() => {

    },[]);
    return (<div>
        Quotation Page
    </div>);
}