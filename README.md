# AI Prompt Playground

## LLM Understanding

### What is an LLM?

A Large Language Model (LLM) is a type of AI that can read, understand, and write text like a human. It learns from lots of data and can answer questions, write stories, or do tasks with text.

### What temperature means?

Temperature controls how creative the AI is.

- Low (0–0.3) → safe and predictable answers.
- Medium (0.4–0.7) → balanced answers.
- High (0.8–1) → more creative and random answers.

### When to choose a bigger vs smaller model?

- Bigger models → better at understanding, more accurate, good for hard tasks.
- Smaller models → faster, cheaper, good for simple tasks.

### What you would improve if given one extra day?

- Add user accounts for saving prompts and history.
- More models and options to choose from.
- Better UI/UX design.
- More error handling and validation.

## Thought Process

### Hardest part of the task

Hardest part is the stream response handling form server and client side. but i have do this in my previous projects so it was easier this time. but when i was doing it first time it was really hard to figure out how to do it.

### How you approached problems or bugs

In this project, I faced an issue where OpenAI was returning a streaming response, and my server was also sending the response as a stream. But on the client side, for some reason, it was displaying everything at once. After reviewing the code, I found that when I called the generate API, I was managing an isLoading state that stayed true until the full response was received. Because of that, the UI wasn't updating during the stream. So I added another state to track whether the response was currently streaming and then it worked.

### What you learned

Even though I’ve done similar projects before, in this project I learned that problems can come from anywhere even from very small things, like the isLoading state in my case. So while debugging, you always need to check everything carefully

### What you would improve in code/structure

First of all I would like to add user authentication so that each user can have their own history. Secondly I would like to add more models and options to choose from. Currently i am just using shadcn ui for crating the UI so, I would like to improve the UI/UX of the application. Lastly I would like to add more error handling and validation to the application.
