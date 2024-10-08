"use client";
import React, { useState } from "react";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";

export default function RequestProof() {
  const [requestUrl, setRequestUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reclaimClient = new Reclaim.ProofRequest(
    "f9f383fd-32d9-4c54-942f-5e9fda349762"
  );

  const handleReqProof = async () => {
    try {
      setIsLoading(true);
      console.log("Requesting proof...");

      const response = await fetch(
        `https://www.solxpass.me/api/proof?id=0&userId=23124141123121`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reqUrl = data.requestUrl;
        console.log("Request URL received:", reqUrl);

        setRequestUrl(reqUrl);
        reclaimClient.setStatusUrl(data.statusUrl);

        await reclaimClient.startSession({
          onSuccessCallback: (proofs) => {
            console.log("Proofs received:", proofs);
            localStorage.setItem("savedProofs", JSON.stringify(proofs));
            const signatures = proofs[0]?.signatures;
            if (signatures) {
              console.log("Signatures found:", signatures);

              localStorage.setItem("savedSign", JSON.stringify(signatures));
            } else {
              console.error("Signatures not found in the proofs object");
            }
          },
          onFailureCallback: (error) => {
            console.error("Session failed:", error.message);
          },
        });
      } else {
        console.error("Failed to fetch request proof");
      }
    } catch (err) {
      console.error("Error requesting proof:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 p-6 rounded-lg shadow-lg">
      {requestUrl && (
        <div className="mb-4 p-4 bg-white rounded-lg">
          <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={requestUrl}
            viewBox={`0 0 256 256`}
          />
        </div>
      )}
      <button
        type="submit"
        onClick={handleReqProof}
        className={`bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Generate Proof"}
      </button>
    </div>
  );
}
