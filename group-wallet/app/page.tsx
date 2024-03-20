"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";
import React from "react";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  amount: z.string().min(1, {
    message: "Amount must be at least 1 characters.",
  }),
  paid_by: z.string().min(1, {
    message: "Paid by must be at least 1 characters.",
  }),
  split_type: z.string().min(1, {
    message: "Split type must be at least 1 characters.",
  }),

});


export default function Home() {

  const [isFormVisible, setIsFormVisible] = useState(false);
  const expenses = JSON.parse(localStorage?.getItem("expenses") || "[]") || [];
  expenses.reverse();

  //count the total amount you owe and lent
  const expensePerUser = JSON.parse(localStorage.getItem("expensePerUser") || "{}");
  let totalOwed = 0;
  for(const item in Object.keys(expensePerUser)) {
    
    const user = Object.keys(expensePerUser)[item];
    if(user !== "you") {
      totalOwed += expensePerUser[user].owes || 0;
    }

  }
  const totalLent = expensePerUser["you"] ? Object.keys(expensePerUser["you"].owes).reduce((acc, user) => {
    return acc + expensePerUser["you"].owes[user];
  }, 0) : 0;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      description: "",
      amount: "",
      paid_by: "",
      split_type: "",

    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {

    // store in the local storage in a list of expenses
    expenses.push(values);
    const selectedUser = values.username;
    const amount:number = Number(values.amount);
    console.log("values", values);
    const expensePerUser = JSON.parse(localStorage.getItem("expensePerUser") || "{}");
    const owedByUser = expensePerUser[selectedUser]?.owes || 0;
    const owedByYou = expensePerUser["you"]?.owes[selectedUser] || 0;

    if(values.split_type === "Equally") {

      //get current owed amount for each user
      const splitAmount:number = Number(amount) / 2;
      
      const expenseForUser = {
        selectedUser: {
          owes: splitAmount + owedByUser,
        }
      }
      const expenseForYou = expensePerUser["you"] ? {
        "you": {
          owes: {
            ...expensePerUser["you"].owes,
            [selectedUser]: splitAmount + owedByYou
          }
        }
        } : {
        "you": {
          owes: {
            [selectedUser]: splitAmount + owedByYou
          }
        }
      }

      expensePerUser[selectedUser] = expenseForUser.selectedUser;
      expensePerUser["you"] = expenseForYou["you"];

    }
    else if(values.split_type === "You owe the full amount") {

      const expenseForUser = {
        selectedUser: {
          owes: Number(amount) + owedByUser,
        }
      }
      const expenseForYou = expensePerUser["you"] ? {
        "you": {
          owes: {
            ...expensePerUser["you"].owes,
            [selectedUser]: owedByYou
          }
        }
        } : {
        "you": {
          owes: {
            [selectedUser]: owedByYou
          }
        }
      }

      expensePerUser[selectedUser] = expenseForUser.selectedUser;
      expensePerUser["you"] = expenseForYou["you"];

    }
    else if(values.split_type === "They owe the full amount") {
        
        const expenseForUser = {
          selectedUser: {
            owes: owedByUser
          }
        }
      const expenseForYou = expensePerUser["you"] ? {
        "you": {
          owes: {
            ...expensePerUser["you"].owes,
            [selectedUser]: Number(amount) + owedByYou
          }
        }
        } : {
        "you": {
          owes: {
            [selectedUser]: Number(amount) + owedByYou
          }
        }
      }
  
        expensePerUser[selectedUser] = expenseForUser.selectedUser;
        expensePerUser["you"] = expenseForYou["you"];
    }
    else{
      //throw error
      alert("Invalid split type");
    }
    localStorage.setItem("expensePerUser", JSON.stringify(expensePerUser));
    localStorage.setItem("expenses", JSON.stringify(expenses));
    //toast message for success
    alert("Expense added successfully");

    form.reset();
    
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">

      {isFormVisible && (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="items-center justify-center">
        
          <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
          />

          <FormField 
            control={form.control} 
            name="description"
            render ={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a Description" {...field} />
                </FormControl>
                {/* Any additional fields for description */}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {
            form.getValues('username') && form.getValues('username').length>0 && (
              <FormField
                control={form.control}
                name="paid_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid By</FormLabel>
                    <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="you">You</SelectItem>
                        <SelectItem value="user">{form.getValues('username')}</SelectItem>
                      </SelectContent>
                    </Select>

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }
          

          <FormField
            control={form.control}
            name="split_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Split Type</FormLabel>
                <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Equally" > Equally </SelectItem>
                      <SelectItem value="You owe the full amount" > You owe the full amount </SelectItem>
                      <SelectItem value="They owe the full amount" > They owe the full amount </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="mt-5 mb-5 items-center justify-center">
          <Button type="submit">Submit</Button>
          <Button className="ml-5 " onClick={() => setIsFormVisible(false)}>Close</Button>
        </div>
        </form>
      </Form>
      )}

      {
        !isFormVisible && (
          <React.Fragment> 
            <Button className="" onClick={() => setIsFormVisible(true)}>Add a new expense</Button>

            {/* show total what you owe and lent */}
            <div className="flex flex-row mt-5">
              <div className="flex flex-col text-green-400 mr-5">
                <h2>Total Owed</h2>
                <p>{totalOwed}</p>
              </div>
              <div className="flex flex-col text-red-400 ml-5">
                <h2>Total Lent</h2>
                <p>{totalLent}</p>
              </div>
            </div>

            {/* Show the history from the list of expenses stored in the local storage */}
            {/* limit to last 5 records */}
            <TableCaption>A list of your recent invoices.</TableCaption>
            <div className="mt-5">
              <Table>
                  <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Paid By</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Split Type</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                    {
                    expenses && expenses.length>0 && 
                    expenses.map((expense:any, index:any) => 
                    index < 5 &&
                    (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{expense.paid_by=='you'?'you':expense.username}</TableCell>
                        <TableCell>{expense.amount}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right">{expense.split_type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
              </Table>
            </div>
          </React.Fragment>
          
          )
      }

    </div>
  )
}
