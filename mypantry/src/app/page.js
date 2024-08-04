'use client';
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import Image from "next/image";

export default function Home() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('name');

    useEffect(() => {
        const fetchItems = async () => {
            const itemsCollection = collection(db, "items");
            const itemsSnapshot = await getDocs(itemsCollection);
            const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(itemsList);
            setTotal(itemsList.reduce((acc, item) => acc + item.quantity, 0));
        };
        fetchItems();
    }, []);

    const handleAddOrUpdateItem = async (e) => {
        e.preventDefault();

        if (!itemName.trim() || !itemQuantity || isNaN(itemQuantity) || itemQuantity <= 0) {
            alert('Please enter a valid item name and quantity.');
            return;
        }

        const newItem = { name: itemName.trim(), quantity: parseInt(itemQuantity) };

        if (editIndex !== null) {
            const itemDoc = doc(db, "items", items[editIndex].id);
            await updateDoc(itemDoc, newItem);
            const updatedItems = items.map((item, index) =>
                index === editIndex ? { id: itemDoc.id, ...newItem } : item
            );
            setItems(updatedItems);
            setTotal(total - items[editIndex].quantity + newItem.quantity);
            setEditIndex(null);
        } else {
            const docRef = await addDoc(collection(db, "items"), newItem);
            newItem.id = docRef.id;
            setItems([...items, newItem]);
            setTotal(total + newItem.quantity);
        }

        setItemName('');
        setItemQuantity('');
    };

    const handleDeleteItem = async (index) => {
        const itemDoc = doc(db, "items", items[index].id);
        await deleteDoc(itemDoc);
        const newItems = items.filter((_, i) => i !== index);
        const itemQuantity = items[index].quantity;
        setItems(newItems);
        setTotal(total - itemQuantity);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedItems = filteredItems.sort((a, b) => {
        if (sortOrder === 'name') {
            return a.name.localeCompare(b.name);
        } else {
            return a.quantity - b.quantity;
        }
    });

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-purple-100">
            <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm">
                <h1 className="text-4xl p-4 text-center text-purple-900">Pantry Tracker</h1>
                <div className="bg-purple-800 p-6 rounded-lg shadow-lg text-white">
                    <form className="grid grid-cols-6 gap-4 items-center" onSubmit={handleAddOrUpdateItem}>
                        <input 
                            className="col-span-3 p-3 border border-purple-500 rounded text-gray-900"
                            type="text"
                            placeholder="Enter Item"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                        />
                        <input 
                            className="col-span-2 p-3 border border-purple-500 rounded text-gray-900"
                            type="number"
                            placeholder="Enter Quantity"
                            value={itemQuantity}
                            onChange={(e) => setItemQuantity(e.target.value)}
                        />
                        <button 
                            className="text-white bg-purple-900 hover:bg-purple-700 p-3 rounded text-xl"
                            type="submit"
                        >
                            {editIndex !== null ? 'Update' : 'Add'}
                        </button>
                    </form>

                    <div className="mt-4 flex justify-between items-center">
                        <input
                            className="p-3 border border-purple-500 rounded text-gray-900"
                            type="text"
                            placeholder="Search Items"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <select
                            className="p-3 border border-purple-500 rounded text-gray-900"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="name">Sort by Name</option>
                            <option value="quantity">Sort by Quantity</option>
                        </select>
                    </div>

                    <ul className="mt-4">
                        {sortedItems.map((item, id) => (
                            <li key={id} className="my-4 w-full flex justify-between bg-purple-700 rounded">
                                <div className="p-4 w-full flex justify-between text-white">
                                    <span className="capitalize">{item.name}</span>
                                    <span>{item.quantity}</span>
                                </div>
                                <div className="flex">
                                    <button 
                                        className="p-4 border-l-2 border-purple-600 hover:bg-yellow-400 w-16 rounded-r text-white"
                                        onClick={() => {
                                            setItemName(item.name);
                                            setItemQuantity(item.quantity);
                                            setEditIndex(id);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="ml-2 p-4 border-l-2 border-purple-600 hover:bg-red-600 w-16 rounded-r text-white"
                                        onClick={() => handleDeleteItem(id)}
                                    >
                                        X
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 text-purple-200 text-right">
                        <strong>Total Items:</strong> {total}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-purple-200 via-purple-200 dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
                <a
                    className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    By{" "}
                    <Image
                        src="/vercel.svg"
                        alt="Vercel Logo"
                        className="dark:invert"
                        width={100}
                        height={24}
                        priority
                    />
                </a>
            </div>

            <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-purple-200 before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-purple-300 after:via-purple-400 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-purple-700 before:dark:opacity-10 after:dark:from-purple-900 after:dark:via-[#5e00ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
                <Image
                    className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
                    src="/next.svg"
                    alt="Next.js Logo"
                    width={180}
                    height={37}
                    priority
                />
            </div>
        </main>
    );
}