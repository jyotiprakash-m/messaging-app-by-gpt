"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import styles from "./page.module.css";

const contractAddress = "0x0855fB3C48B9Dc7B8e039Adc33bADbBeBBd443F7"; // Replace with your contract address
const contractABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "content",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "imageUrl",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "MessageSent",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_sender",
        type: "address",
      },
    ],
    name: "getAllReceivers",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
    ],
    name: "getConversation",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            internalType: "string",
            name: "content",
            type: "string",
          },
          {
            internalType: "string",
            name: "imageUrl",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct MessagingApp.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
      {
        internalType: "string",
        name: "_content",
        type: "string",
      },
      {
        internalType: "string",
        name: "_imageUrl",
        type: "string",
      },
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [receivers, setReceivers] = useState([]);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [receiver, setReceiver] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    connectToMetaMask();
  }, []);

  async function connectToMetaMask() {
    try {
      if (window.ethereum) {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        setProvider(provider);
        setSigner(signer);
        setContract(contract);

        // Retrieve receivers of the current user
        const userAddress = await signer.getAddress();
        const userReceivers = await contract.getAllReceivers(userAddress);
        setReceivers(userReceivers);

        // Set selected receiver to the first receiver by default
        if (userReceivers.length > 0) {
          setSelectedReceiver(userReceivers[0]);
          retrieveConversation(userReceivers[0]);
        }
      } else {
        throw new Error("MetaMask not found");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  }

  async function retrieveConversation(receiverAddress) {
    try {
      const userAddress = await signer.getAddress();
      const conversation = await contract.getConversation(
        userAddress,
        receiverAddress
      );
      setMessages(conversation);
    } catch (error) {
      console.error("Error retrieving conversation:", error);
    }
  }

  async function sendMessage() {
    try {
      if (!receiver || !content) {
        setStatus("Please enter a receiver and a message");
        return;
      }

      setStatus("Sending message...");

      const userAddress = await signer.getAddress();
      await contract.sendMessage(userAddress, receiver, content, imageUrl);

      setStatus("Message sent!");
      setContent("");
      setImageUrl("");

      // Refresh conversation after sending the message
      retrieveConversation(receiver);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("Failed to send message");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1>Receivers</h1>
        <div className={styles.receiverList}>
          {receivers.map((receiver) => (
            <div
              key={receiver}
              className={`${styles.receiver} ${
                selectedReceiver === receiver ? styles.selectedReceiver : ""
              }`}
              onClick={() => {
                setSelectedReceiver(receiver);
                retrieveConversation(receiver);
              }}
            >
              {receiver}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.messages}>
          {messages.map((message, index) => (
            <div key={index} className={styles.message}>
              <div className={styles.messageSender}>{message.sender}</div>
              <div className={styles.messageContent}>{message.content}</div>
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Message Image"
                  className={styles.messageImage}
                />
              )}
            </div>
          ))}
        </div>
        <div className={styles.messageInput}>
          <input
            type="text"
            placeholder="Enter receiver"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter your message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
        <div className={styles.status}>{status}</div>
      </div>
    </div>
  );
}
