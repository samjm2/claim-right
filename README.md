# ClaimRight

## What is this?

Sometimes your health insurance says "no, we're not paying for that." That's called a denial. When it happens, they send you a bunch of confusing papers full of codes and dates and rules. Most people have no idea what any of it means, so they just give up and pay the bill.

ClaimRight reads all those papers for you and tells you what's going on in normal words. And sometimes it even finds a mistake the insurance company made.

## The story we use to show it off

A made-up person named Maya got a knee MRI. It cost $4,800. Her insurance said no, because they claim "nobody asked us for permission first."

But here's the thing: Maya *did* get permission. She has a paper that proves it. The insurance company just didn't look at their own records.

ClaimRight catches this. It reads Maya's 5 papers, notices that one paper says "no permission" and another paper says "permission approved," and goes "wait a second, these two don't match." Then it helps Maya write a letter to fight back.

## What it does, step by step

1. **You give it your papers.** Upload up to 5 PDFs (the denial letter, the bill, the doctor's note, and so on). Don't have any? There's a button to load Maya's papers so you can try it.
2. **It reads them.** It pulls out the important stuff, like the money amount, the dates, and the deadline to fight back. Every single fact shows you exactly where it found it, so it's not just making things up.
3. **It finds the problem.** It compares all the papers against each other. If one says one thing and another says the opposite, it flags it.
4. **It shows you.** You get a clean page with a summary, a timeline of what happened, and the mistake it found (with proof you can click on).
5. **It writes your letter.** It makes an appeal letter for you using only the facts it's sure about. You can edit it, turn parts on and off, and download the whole thing as a PDF.

## The cool part

Most apps that "use AI" just ask a chatbot to read stuff and hope it's right. Chatbots make mistakes and make stuff up, which is really bad when a wrong date could cost you thousands of dollars.

ClaimRight is different. The part that finds the mistake isn't a chatbot guessing. It's actual rules we wrote that check things the same way every single time:

- Is it the same patient on both papers?
- Same doctor's office?
- Same service?
- Did the MRI happen while the permission was still good?

If all of those match and the insurance still said "no permission," that's the mistake. It runs the same checks every time and can prove every answer. It never says the insurance "broke the law" or promises you'll win, because that wouldn't be honest.

## What it won't do

- It won't promise your appeal will work.
- It won't give legal or medical advice.
- It won't send anything for you. You're always in charge.
- It won't make up facts. If it's not sure about something, it leaves it blank and tells you.

## Trying it yourself

```
npm install
npm run dev
```

Then open your browser to the address it prints (usually `http://localhost:3000`).

Click "Look at my denial," sign in (any email and password works, it's just a demo), then on the upload page hit "Load the sample case" to use Maya's papers.

## The papers are fake

Everything in the demo is made up. Maya isn't real, and none of the documents are from a real insurance company. Don't upload anyone's real medical info while showing it off.

## What it's built with

- Next.js and React (the website part)
- TypeScript (the code)
- A little rule engine we wrote ourselves (the part that finds mistakes)
- pdfkit (makes the downloadable PDF)
