"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "../../../../../../component/loadingSpinner";

export default function AddDesignPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { id } = params;

  return(
    <div>Update</div>
  );
}
