
The GLM-4 model (developed by Zhipu AI) utilizes a **Function Calling** (often referred to as "Tool Use") mechanism that allows the model to interact with external functions, APIs, or data sources.

GLM-4’s tool-calling syntax is highly compatible with the OpenAI function-calling standard, but it is accessed via the Zhipu AI (BigModel) API endpoints.

Here is the technical breakdown of the syntax for defining tools and handling tool calls in GLM-4.

### 1. Defining Tools (The Request)

When sending a request to GLM-4, you define the available tools using the `tools` parameter in the JSON payload. This is a list of JSON objects, where each object defines a specific function.

**Structure:**
* `type`: Always `"function"`.
* `function`: An object containing the details of the tool.
  * `name`: The name of the function (must be a-z, A-Z, 0-9, underscores, or dashes).
  * `description`: A description of what the function does (helps the LLM decide when to use it).
  * `parameters`: A JSON Schema object defining the input arguments the function accepts.

**JSON Payload Example:**
```json
{
  "model": "glm-4",
  "messages": [
    {
      "role": "user",
      "content": "What is the weather in Beijing and Paris?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get the current weather for a specific location.",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g., San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"],
              "description": "The temperature unit to use."
            }
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

---

### 2. The Model's Response (Tool Call)

If the model determines it needs to use a tool to answer the prompt, it will return a message with the `role` set to `assistant` and include a `tool_calls` array.

**Key Syntax Elements:**
* `role`: `"assistant"`
* `tool_calls`: A list of tool call objects.
  * `id`: A unique ID for this specific tool call.
  * `type`: Always `"function"`.
  * `function`: Contains the `name` of the function to call and the `arguments` (a JSON string of the parameters).

**JSON Response Example:**
```json
{
  "id": "chatcmpl-123",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "get_weather",
              "arguments": "{\"location\": \"Beijing, China\", \"unit\": \"celsius\"}"
            }
          },
          {
            "id": "call_def456",
            "type": "function",
            "function": {
              "name": "get_weather",
              "arguments": "{\"location\": \"Paris, France\", \"unit\": \"celsius\"}"
            }
          }
        ]
      }
    }
  ]
}
```

---

### 3. Submitting Tool Outputs (The Callback)

After your system executes the function (e.g., fetches the weather data), you must send the result back to the model so it can formulate the final answer. This is done by appending a new message to the conversation history.

**Syntax Requirements:**
* `role`: Must be `"tool"`.
* `tool_call_id`: The ID of the specific tool call this message is responding to (matches the ID from step 2).
* `content`: The string output of the function execution.

**JSON Payload to Send Back:**
```json
{
  "model": "glm-4",
  "messages": [
    // ... previous messages ...
    {
      "role": "user",
      "content": "What is the weather in Beijing and Paris?"
    },
    {
      "role": "assistant",
      "tool_calls": [
        {
          "id": "call_abc123",
          "type": "function",
          "function": {
            "name": "get_weather",
            "arguments": "{\"location\": \"Beijing, China\", \"unit\": \"celsius\"}"
          }
        }
      ]
    },
    {
      "role": "tool",
      "tool_call_id": "call_abc123",
      "content": "22 degrees Celsius, cloudy"
    }
  ]
}
```

---

### 4. Python SDK Implementation (ZhipuAI)

If you are using the official `zhipuai` Python SDK, the syntax looks like this:

```python
from zhipuai import ZhipuAI

client = ZhipuAI(api_key="YOUR_API_KEY")

# 1. Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        }
    }
]

# 2. Initial Request
response = client.chat.completions.create(
    model="glm-4",
    messages=[
        {"role": "user", "content": "What's the weather like in Shanghai?"}
    ],
    tools=tools,
    tool_choice="auto",
)

# 3. Check if model wants to call a tool
assistant_message = response.choices[0].message
tool_calls = assistant_message.tool_calls

if tool_calls:
    # 4. Handle the tool call locally (Mock function)
    available_functions = {
        "get_weather": get_weather, # Assume this function exists in your code
    }
    
    # Append the model's tool call message to history
    messages_history = [
        {"role": "user", "content": "What's the weather like in Shanghai?"},
        assistant_message
    ]
    
    # 5. Execute function and append result
    for tool_call in tool_calls:
        function_name = tool_call.function.name
        function_to_call = available_functions[function_name]
        function_args = json.loads(tool_call.function.arguments)
        function_response = function_to_call(
            location=function_args.get("location"),
            unit=function_args.get("unit"),
        )
        
        messages_history.append(
            {
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": function_name,
                "content": str(function_response),
            }
        )
    
    # 6. Send result back to model to get final answer
    second_response = client.chat.completions.create(
        model="glm-4",
        messages=messages_history,
    )
    print(second_response.choices[0].message.content)
```

### Native Tool Parameters Reference

When constructing the `parameters` object inside the tool definition (the JSON Schema), GLM-4 supports standard JSON Schema keywords:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `type` | string | The data type of the parameter (e.g., `"object"`, `"string"`, `"number"`, `"integer"`, `"boolean"`, `"array"`). |
| `properties` | object | Defines the keys within the object and their schemas. |
| `required` | array | A list of parameter keys that must be provided. |
| `enum` | array | A list of specific allowed values for the parameter. |
| `description` | string | A description of what the specific parameter represents. |
| `items` | object | If `type` is `"array"`, defines the schema of the items in the array. |

- When you use the GLM Coding Plan (including Max) and call the dedicated coding endpoint, there are NO extra “native coding tools” with special tool‑call syntax baked into the API itself.
- The endpoint is just an OpenAI‑style chat completions endpoint:
  - Base URL: https://api.z.ai/api/coding/paas/v4
  - Path: /chat/completions
- If you want tools, you define them yourself via the standard `tools` / `tool_calls` mechanism (function calling), same as on the general endpoint and the same shape as OpenAI’s tool‑calling.

So: the tool‑call syntax does not change just because you’re on the “Max Coding Plan” or using the coding endpoint. The endpoint only differs by URL and is optimized for coding scenarios, not by giving you extra built‑in tool names.

Below is the concrete syntax when using the coding endpoint directly.

## 1. Coding endpoint: URL and basic shape

From Z.AI’s docs, the coding endpoint is:【turn1fetch0】【turn1fetch1】

- General endpoint:
  - https://api.z.ai/api/paas/v4/...
- Coding endpoint (GLM Coding Plan):
  - https://api.z.ai/api/coding/paas/v4/...

The “Other Tools” integration guide confirms that OpenAI‑compatible tools should simply change their base URL to the coding endpoint:【turn8fetch0】

- Base URL:
  - https://api.z.ai/api/coding/paas/v4
- Then you call:
  - POST https://api.z.ai/api/coding/paas/v4/chat/completions

Headers (same as general API):【turn1fetch1】

- Content-Type: application/json
- Authorization: Bearer YOUR_API_KEY

## 2. Tool‑call request syntax (coding endpoint)

When you POST to /chat/completions on the coding endpoint, if you want to use tools, you use the same `tools` and `tool_choice` fields as documented under “Function Calling”:【turn6fetch0】

Core request fields for tools:

- tools
  - Array of tool definitions.
  - Each item:
    - type: currently "function"
    - function:
      - name (string)
      - description (string)
      - parameters (JSON Schema for arguments)

- tool_choice
  - Optional; defaults to "auto".
  - According to the function‑calling docs, only "auto" is supported right now.【turn6fetch0】

Example: calling the coding endpoint with tools

```bash
curl --location 'https://api.z.ai/api/coding/paas/v4/chat/completions' \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "glm-4.7",
    "messages": [
      {
        "role": "user",
        "content": "Scan the current repo and list all TODO comments."
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "scan_repo",
          "description": "Scan a codebase and extract structured information (e.g. list TODOs).",
          "parameters": {
            "type": "object",
            "properties": {
              "path": {
                "type": "string",
                "description": "Root path of the repo to scan."
              },
              "pattern": {
                "type": "string",
                "description": "Regex pattern for comments to match, e.g. \\'TODO\\'."
              }
            },
            "required": ["path"]
          }
        }
      }
    ],
    "tool_choice": "auto"
  }'
```

Key points:

- The only difference vs the general endpoint is the base URL.
- The shape of tools / tool_choice is exactly what’s described in the Function Calling capability docs (glm‑4.7, glm‑4.6, glm‑4‑plus, etc. all support this).【turn6fetch0】

## 3. Tool‑call response syntax (coding endpoint)

When the model decides to call a tool, the assistant message from the coding endpoint will include a `tool_calls` field, again exactly like the general endpoint:【turn6fetch0】

Structure:

- choices[i].message
  - role: "assistant"
  - tool_calls: array of:
    - id: string (unique tool call ID)
    - type: "function"
    - function:
      - name: string
      - arguments: string (JSON string)

Example response body:

```json
{
  "id": "20250116120000abcdef1234567890",
  "object": "chat.completion",
  "created": 1737000000,
  "model": "glm-4.7",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "scan_repo",
              "arguments": "{\"path\": \".\", \"pattern\": \"TODO\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ],
  "usage": {
    "prompt_tokens": 200,
    "completion_tokens": 50,
    "total_tokens": 250
  }
}
```

This is the same schema as shown in the Function Calling examples (they use the general endpoint, but the coding endpoint is documented as OpenAI‑compatible and shares the same model capabilities).【turn6fetch0】【turn8fetch0】

## 4. Returning tool outputs (tool role messages)

To send tool results back to the model, you append messages with:

- role: "tool"
- tool_call_id: the id from the corresponding tool_call
- content: the result of the tool (usually JSON stringified)

Example continuation:

```json
{
  "model": "glm-4.7",
  "messages": [
    {
      "role": "user",
      "content": "Scan the current repo and list all TODO comments."
    },
    {
      "role": "assistant",
      "tool_calls": [
        {
          "id": "call_abc123",
          "type": "function",
          "function": {
            "name": "scan_repo",
            "arguments": "{\"path\": \".\", \"pattern\": \"TODO\"}"
          }
        }
      ]
    },
    {
      "role": "tool",
      "tool_call_id": "call_abc123",
      "content": "[{\"file\":\"src/main.ts\",\"line\":42,\"text\":\"TODO: refactor\"}]"
    }
  ]
}
```

Again, this matches the official Function Calling examples (just pointed at /coding/paas/v4 instead of /paas/v4).【turn6fetch0】

## 5. Streaming tool calls (optional)

If you’re streaming on the coding endpoint and want tool call information streamed, you can use the “Tool Streaming Output” feature. The parameters are:【turn11click0】【turn12click0】

- stream: true
- tool_stream: true (Z.AI‑specific)

The streaming delta then includes:

- reasoning_content (model reasoning)
- content (text response)
- tool_calls (tool call info streamed incrementally)

Example (conceptual; same as docs but against the coding base URL):

```python
from zai import ZaiClient

client = ZaiClient(api_key="YOUR_API_KEY")

response = client.chat.completions.create(
    base_url="https://api.z.ai/api/coding/paas/v4",  # coding endpoint
    model="glm-4.6",  # or glm-4.7 if supported for tool_stream
    messages=[
        {"role": "user", "content": "Check the code and run tests if needed."},
    ],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "run_tests",
                "description": "Run test suite and report results.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "test_path": {"type": "string", "description": "Test folder path"},
                    },
                    "required": ["test_path"],
                },
            },
        }
    ],
    stream=True,
    tool_stream=True,
)
```

The delta’s tool_calls format is the same as non‑streaming; it’s just streamed.

## 6. About “Max Coding Plan” and any special tools

The GLM Coding Plan “Max” tier is documented only as increasing usage limits (prompts per 5 hours, and overall token allowance). It does not mention additional built‑in tools or any special tool names:【turn4fetch0】

- Lite / Pro / Max differ only in quotas, not in capabilities or APIs.
- The coding endpoint is explicitly described as:
  - An OpenAI‑compatible endpoint for coding scenarios.
  - To be used instead of the general endpoint, but not with additional tool parameters. 【turn1fetch1】【turn8fetch0】

There ARE “Tools” in the docs (e.g. Web Search, Vision MCP, Web Reader MCP), but those are:

- Either standalone APIs (like Web Search API) that you call separately,【turn3click0】
- Or MCP servers that your coding tool (Claude Code, Cline, Roo Code, etc.) connects to — they don’t show up as “native” tool names in the chat.completions schema for the coding endpoint itself.【turn4fetch0】【turn15fetch0】

So from your coding endpoint’s point of view, you do NOT get:

- No reserved tool names like "web_search" or "run_code" that are magically available just because you’re on the Max Coding Plan.
- No extra request fields for tools beyond the standard OpenAI‑style tools / tool_calls / tool_choice.

Instead:

- You define your own tools via `tools` (function calling).
- Your agent or coding tool implements them (e.g., “read file”, “run tests”, “search repo”).
- The model on the coding endpoint just calls the functions you defined using the syntax above.

## 7. Summary: what you need to know practically

- Endpoint:
  - Coding endpoint: POST https://api.z.ai/api/coding/paas/v4/chat/completions【turn1fetch0】【turn1fetch1】
- Plan tier (Lite/Pro/Max) → only affects usage limits; no extra native tools.【turn4fetch0】
- Tool definition syntax (tools / tool_choice / tool_calls / tool responses):
  - Identical to the Function Calling docs for GLM‑4.x models.【turn6fetch0】
- Optional Z.AI‑specific streaming behavior:
  - Use tool_stream=True in addition to stream=True for streaming tool calls.【turn11click0】【turn12click0】

If you’re integrating your own agent directly against the coding endpoint (not through an existing IDE plugin), you can treat it as “OpenAI‑style chat completions with function calling, just at a different base URL.” The actual function definitions and their implementations are up to you; the API doesn’t ship pre‑wired coding tools with special syntax.

- No, GLM’s coding endpoint does NOT have its own special “native” tool names for basic read/write (like `read_file`, `write_to_file`, etc.).
- The coding endpoint is just the OpenAI‑style chat API at a different URL; all tools are whatever YOU define using standard `tools` / `tool_calls` function‑calling. Z.AI’s docs even show a completely generic `file_operations` example, not some hardcoded schema.【turn4click0】【turn3fetch0】
- So if your agent is being inefficient or prefers to edit `README.md` instead of creating a new file, that’s a tool‑design / prompting / orchestration issue, not because GLM expects some different set of file‑tool names.

Let me break that down and then give concrete suggestions for your CLI.

## 1. What GLM actually provides for tools on the coding endpoint

- The coding endpoint is simply:

  - `https://api.z.ai/api/coding/paas/v4` instead of the general `https://api.z.ai/api/paas/v4`【turn4click0】【turn9find1】
  - It is explicitly documented as “OpenAI protocol” compatible: you change the base URL and use the same chat.completions structure.【turn4click0】

- Function calling is the same on both endpoints:
  - `tools`: list of function definitions (name, description, JSON Schema for params).
  - `tool_choice`: currently only `"auto"` is supported.【turn1fetch1】
  - `tool_calls`: the model returns function calls with `id`, `type: "function"`, `function.name`, and `function.arguments` (a JSON string).【turn1fetch1】

- The Function Calling docs explicitly show a generic file tool example:

  - Name: `file_operations`
  - Operation type enum: `["read", "write", "list"]`
  - Params: `operation`, `file_path`, and optional `content` for writes.【turn3fetch0】

  They treat this as a user‑defined example, not a reserved/built‑in tool. If GLM had its own canonical read/write tools, the docs would very likely call those out — they don’t.

- The “Other Tools” guide only says:

  - GLM Coding Plan works with any tool that supports the OpenAI protocol.
  - You swap in `https://api.z.ai/api/coding/paas/v4` as the base URL.
  - Nothing about special tool names; tool definitions still live on your side.【turn4click0】

So: GLM doesn’t know about `read_file` or `write_to_file` unless you send them as part of `tools`.

## 2. Why GLM often seems “inefficient” with tools in coding scenarios

A few things that tend to happen with GLM (and other models) in Claude Code‑like setups:

- It over‑calls “safe” tools:
  - It may keep calling `list_files`, `read_file`, `search_files` because those feel low‑risk and give it more context.
- It under‑uses “big” tools:
  - Multi‑file edits, creating new files, or running commands feel more impactful, so it’s more conservative.
- It reuses existing files:
  - You’re seeing this with `README.md`. The model thinks, “This is already a markdown doc in the repo; better to extend it than to create a new one.” That’s a behavioral bias, not an API constraint.
- It burns turns on “exploration”:
  - If your max is 20 turns and the first 10–12 are `list_files`, `read_file`, `grep`, there’s not much budget left for the actual work.

These are exacerbated by:

- How tools are named and described.
- How the system prompt frames what the agent is supposed to prioritize.
- How many tools are visible at once (too many tools → more flailing).

## 3. File‑tool design: what GLM “expects” (even though nothing is mandated)

Even though there are no reserved tools, GLM was trained on a lot of codebases + tools. In practice, it tends to respond best when your file tools look like this (this is aligned with Z.AI’s own `file_operations` example and what many tools do):【turn3fetch0】

- read_file:
  - Required: a single path argument, e.g. `path`.
  - Returns: full file contents as a string.

  Example tool schema:

  ```json
  {
    "type": "function",
    "function": {
      "name": "read_file",
      "description": "Read the full text of a single file at the given path. Use this when you need to see the exact contents of a file.",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "Absolute or repo‑relative path to the file."
          }
        },
        "required": ["path"]
      }
    }
  }
  ```

- write_file:
  - Required: `path` + `content`.
  - Very clear that it creates or overwrites the file, and does not append by default.

  Example schema:

  ```json
  {
    "type": "function",
    "function": {
      "name": "write_file",
      "description": "Create a new file or completely replace an existing file with the given content. Use this when you want to write a standalone document or source file. Do NOT use this to append to an existing file.",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "Path where the file should be written."
          },
          "content": {
            "type": "string",
            "description": "Full file content."
          }
        },
        "required": ["path", "content"]
      }
    }
  }
  ```

- (Optional) append_to_file:
  - If you want a separate append operation, give it its own tool and clearly mark it as “append” so the model can choose appropriately when that’s really needed.

Z.AI’s own `file_operations` uses `operation: "read"/"write"/"list"` in one tool, which also works; but splitting into `read_file`, `write_file`, `list_directory` is often clearer for agents.【turn3fetch0】

## 4. Why your model prefers to “modify README.md” instead of “create new markdown”

Given the above, the behavior you’re seeing is almost certainly about:

- Tool descriptions and expectations.
- How “document‑creation” is framed in the prompt.

Common causes:

- `write_file` is not clearly “create new / overwrite”:
  - If the description is vague like “Write content to a file,” the model may treat it as “write content to a markdown file,” and then default to an obvious target like `README.md`.
- You don’t have an explicit “create new doc” instruction:
  - Without explicit nudging (“Prefer creating new documentation files in /docs over adding to README.md unless the user says otherwise”), models often gravitate to the main existing doc.
- README is the “central place” in its training:
  - Many training examples show “add docs to README,” so it’s a strong prior.

Things to try:

- Make `write_file` very explicit:

  - “Create a new file at path with the given content. If the file already exists, it will be completely overwritten. Do NOT use this for small edits or appending to existing docs; use edit_file (or patch_file) instead.”

- Introduce separate tools with distinct semantics:

  - `create_file`: emphasized for new documents, with description like “Create a new file; fail if it already exists.”
  - `edit_file` or `apply_diff`: for targeted edits on existing files.

- Encode your preferences in the system prompt:

  - Something like:
    - “When asked to create documentation, prefer creating new files under /docs or in an appropriate location, rather than modifying README.md, unless the user explicitly requests updating README.”
    - “Use read_file and write_file sparingly; avoid repeatedly rereading files whose contents are already known. If you’ve already read a file and it hasn’t changed, assume its content instead of calling read_file again.”

## 5. Tool efficiency: reducing turn count

Currently cap at 20 turns and Floyd often hits that before finishing. Here are practical levers:

### a) Reduce redundant “exploration”

- Give it better context up front:
  - For “edit this project,” consider:
    - Pre‑load a high‑level file tree or summary in the system prompt.
    - Start with a single `list_directory` of the repo, and tell it to cache that structure mentally instead of constantly asking.
- Prompt guidance:
  - “You already have an initial view of the project structure. Avoid repeatedly calling list_directory or read_file unless you have a specific reason to believe something changed.”
- Hide over‑used tools when they’re not necessary:
  - For a focused “create a new markdown doc” task, you might temporarily suppress `list_directory` or `search_files` so the model can’t waste turns on them.

### b) Prefer “batch” tools

Instead of one file per tool call:

- `read_multiple_files(paths: string[])`:
  - Returns a map `path -> content`.
- `apply_diffs(diffs: array)`:
  - Applies a set of file changes in one go.

You’d still implement these on your side, but giving the model these higher‑level tools can reduce the number of round trips drastically.

### c) Teach a “plan then act” pattern

- You can add an explicit `plan` mode:

  - Ask the model to first produce a plan as text, you confirm it, and then it executes.
  - Example system instruction:

    - “First, think through the steps and produce a short plan in a code fence. Wait for confirmation before taking any tool actions. Use tools efficiently and avoid unnecessary calls.”

  - This doesn’t change the API, but it cuts down on blind tool thrashing.

### d) Use the model’s own reasoning to your advantage

- GLM‑4.7 is tuned for complex tool use and multi‑step reasoning【turn0search15】.
- You can explicitly tell it:

  - “You have a limited budget of tool calls. Use the smallest number of tools necessary to accomplish the task. Prefer combining multiple changes in one write_file call instead of many small writes.”

## 6. 
- GLM Coding Plan doesn’t define a fixed set of tools like `read_file`, `write_to_file`, etc. as reserved names.
- Z.AI’s Function Calling page only shows generic examples (weather, `file_operations`, external API) and best practices, not a hard “standard library” of tools.【turn3fetch0】【turn1fetch1】
- The “Other Tools” section just tells you to point OpenAI‑compatible tools at the coding endpoint; it doesn’t add special tool schemas.【turn4click0】

So if your CLI works similarly to Claude Code but with your own tools, you are already in the right place: you define the tools, GLM just calls them.

What can help a lot is:

- Aligning your tools with the patterns GLM has seen (single path argument for read_file, clear semantics for write_file vs edit/append, etc.).
- Using strong system instructions to penalize turn‑wasting and to guide where new docs should go.

## 7. Concrete next steps for your CLI

If you want, here’s a checklist you could run through:

- [ ] Review your file tool definitions:
  - Are they close to the `read_file` / `write_file` shapes above?
  - Are descriptions explicit about “create new” vs “edit existing” vs “append”?

- [ ] Adjust the system prompt for doc tasks:
  - Add explicit guidance about creating new markdown files instead of always editing README.md.
  - Add a line like: “Do not repeatedly reread files whose contents are already in context.”

- [ ] Consider a `write_new_file` tool:
  - If you want, model‑level “only create if doesn’t exist” semantics can be encoded so the model is more comfortable creating docs.

- [ ] Add or emphasize “multi‑file” or “batch” tools if you see lots of single‑file churn:
  - E.g., `apply_changes(changes: [{path, operation, content}])`.

- [ ] Try one or two “golden prompts” for common tasks:
  - For example: “Add a new markdown document in /docs describing $X. Do not modify README.md.”
  - See if GLM converges on a consistent pattern; then hard‑wire that pattern into your system instructions.































**Awesome project. Having a dedicated “prompt & tooling physician” for Floyd is exactly the right move.**

Below are 50 concrete, GLM‑4.7‑specific insights your physician agent can treat as a baseline. They’re based on current docs and analysis as of 2026‑01‑24.【turn1fetch0】【turn1fetch2】【turn7click0】【turn8click0】

I’ll group them so they’re easier to use.

---

## A. Identity and positioning (1–4)

1) GLM‑4.7 is Z.AI’s current text-only flagship coding model (GLM‑4.7, GLM‑4.7‑FlashX, GLM‑4.7‑Flash), positioned for highest performance vs. the Flash variants which are lightweight/cheap or free.【turn1fetch0】

2) Official positioning: “Flagship, Highest Performance,” optimized for agentic coding and stable multi-step reasoning, with 200K context and up to 128K output tokens.【turn1fetch0】【turn6fetch0】

3) GLM‑4.7 focuses on “task completion” rather than single‑shot code generation: it’s meant to autonomously decompose requirements, integrate stacks, and deliver executable frameworks rather than just snippets.【turn4fetch0】

4) It’s the core model behind the GLM Coding Plan (the $3/month Claude Code‑compatible tier) and is integrated into Claude Code, Kilo Code, Cline, Roo Code, etc.【turn1fetch0】【turn4fetch1】

---

## B. Thinking modes: Interleaved / Preserved / Turn-level (5–12)

5) Thinking is ON by default in GLM‑4.7 (unlike GLM‑4.6, which defaulted to hybrid thinking). To disable it, you must explicitly set `"thinking": {"type": "disabled"}`.【turn7click0】

6) Interleaved Thinking: the model thinks before every response and before every tool call, interpreting tool results and then deciding next steps. This makes it better at multi‑step agent workflows than single‑shot reasoning.【turn3fetch0】【turn7click0】

7) Preserved Thinking: in coding/agent scenarios, GLM‑4.7 retains reasoning blocks across turns and reuses them instead of re‑deriving, improving consistency and reducing token waste for long tasks.【turn3fetch0】【turn7click0】

8) On the Coding Plan endpoint, Preserved Thinking is enabled by default; on the general API endpoint, it’s disabled by default. To enable on the API, set `"clear_thinking": false` and always return the complete unmodified `reasoning_content` blocks across turns.【turn7click0】

9) If you modify or reorder `reasoning_content` blocks, Preserved Thinking’s cache hit and continuity degrade, so your orchestrator must treat those blocks as immutable unless you explicitly clear thinking.【turn7click0】

10) Turn‑level Thinking lets you selectively disable reasoning for cheap turns (facts, tweaks) and enable it for heavy tasks (planning, debugging), in the same session. This is new in 4.7.【turn3fetch0】【turn7click0】

11) For heavy multi‑turn agentic benchmarks (τ²‑Bench, Terminal Bench 2), the official recommendation is to turn on Preserved Thinking and use specific temps (0–0.7) and modest `max_new_tokens` (e.g., 16K) rather than extreme lengths.【turn3fetch0】

12) Thinking blocks are designed to be preserved alongside tool results. When building Floyd, always keep and echo back `reasoning_content` exactly as returned when using Preserved Thinking; don’t drop them.【turn7click0】

---

## C. Tool use and function calling (13–22)

13) GLM‑4.7 uses OpenAI‑style function calling: a `tools` array, `tool_choice: "auto"` (only `auto` supported), and `tool_calls` in responses with `id`, `type: "function"`, `function.name`, and `function.arguments` as a JSON string.【turn8click0】

14) The docs explicitly recommend single‑responsibility tools, clear naming, and detailed descriptions of both functions and parameters to help the model understand usage.【turn10fetch0】

15) For parameter design, use enums, defaults, and examples (e.g., `unit: ["celsius","fahrenheit"]`, `default: "celsius"`, `examples: [...]`) – this example is straight from the Z.AI docs and dramatically improves reliability.【turn10fetch0】

16) When tools fail, always return a structured error with `success`, `error`, and `error_code`; docs show this pattern and it helps the model correct itself instead of spiraling.【turn10fetch0】

17) GLM‑4.7 is specifically tuned for better tool invocation, scoring higher on τ²‑Bench (84.7 open‑source SOTA) and BrowseComp vs. 4.6, meaning planning and sequencing of tools improved significantly.【turn4fetch0】【turn1fetch2】

18) Tool Streaming Output is available: you can stream tool call deltas along with reasoning and text, which is useful for real‑time UI but requires careful parsing on Floyd’s side.【turn4fetch0】

19) AI/ML API docs note a maximum of 128 functions in the `tools` list. For Floyd, you should keep the exposed tool set much smaller and context‑specific to avoid decision paralysis.【turn6fetch0】

20) The official recommendation is to give functions detailed doc‑style descriptions plus usage examples; Floyd’s physician should treat tool schema design as a first‑class part of prompt engineering.【turn10fetch0】

21) Function calling is only supported with `tool_choice="auto"` right now; you can’t force or ban particular tools via this field, so control is via tool availability and prompting, not via `tool_choice` enum like other providers.【turn8click0】

22) In local deployment (vLLM/SGLang), GLM‑4.7 uses flags like `--tool-call-parser glm47` and `--enable-auto-tool-choice` for better OpenAI‑style compatibility; your physician should mirror these patterns when designing tool interfaces.【turn3fetch0】

---

## D. Long context, caching, and token behavior (23–27)

23) GLM‑4.7 supports 200K context and up to 128K output tokens on both Z.AI and some providers, but quality still degrades at extreme context lengths, like most models.【turn1fetch0】【turn6fetch0】

24) GLM‑4.7 shows a strong bias toward the beginning of the prompt. For reliable instruction following, front‑load all critical behavioral directives and constraints at the very top of the system prompt, not buried later.【turn13fetch0】

25) Context Caching automatically recognizes repeated prompts/messages and reuses computation; it works across GLM‑4.7/4.6/4.5 and surfaces `usage.prompt_tokens_details.cached_tokens` in responses for billing and observability.【turn12fetch0】

26) Caching is especially valuable for long system prompts and repeated histories. For Floyd, keep system prompts stable across turns rather than constantly rewriting them; this maximizes cache hits and reduces latency/cost.【turn12fetch0】

27) Even with caching, you should design prompts to minimize redundancy—don’t repeat large project context in multiple messages if you can reference an earlier part once and rely on context + thinking.

---

## E. Prompting style and “personality quirks” (28–34)

28) GLM‑4.7 responds best to firm, direct instructions using words like MUST and STRICTLY; soft, polite language (“please”, “consider”) is more likely to be treated as optional.【turn13fetch0】

29) Because GLM‑4.7 is multilingual, it can switch languages unexpectedly or emit thinking in Chinese on the first turn. Always specify a default language (“Always respond in English”) near the start of the system prompt.【turn13fetch0】

30) It’s very good at role‑play and persona maintenance; internal thinking blocks align closely with role prompts, so explicit personas (“You are Floyd’s internal prompt physician…”) are particularly effective.【turn13fetch0】

31) GLM‑4.7 performs a single reasoning pass per prompt and does not continuously re‑evaluate mid‑task; to compensate, design workflows that break tasks into explicit sub‑steps and tools rather than expecting self‑interruption and replanning.【turn13fetch0】

32) Interleaved Thinking is designed for “reason between actions”; you want to structure tool flows so the model has a clear pause point after each tool output to decide the next step. This matches GLM‑4.7’s natural execution pattern.【turn7click0】【turn13fetch0】

33) On Cerebras, it’s explicitly recommended to disable or minimize internal reasoning for simple tasks to reduce overhead; Floyd’s orchestrator can use `disable_reasoning` (Cerebras) or `thinking: {type: "disabled"}` (Z.AI) on lightweight turns.【turn13fetch0】【turn7click0】

34) Front‑loading instructions plus strong role plus default language plus direct MUST‑style constraints is a highly effective combo for stable behavior; think of the first ~5–10 lines of system prompt as “Floyd’s constitution.”【turn13fetch0】

---

## F. Coding strengths and benchmarks (35–40)

35) Coding benchmarks vs. GLM‑4.6: +5.8 points on SWE‑bench Verified (73.8% vs 68.0%), +12.9 on SWE‑bench Multilingual (66.7% vs 53.8%), +16.5 on Terminal Bench 2.0 (41% vs prior).【turn1fetch2】

36) It achieves an open‑weight SOTA 84.9 on LiveCodeBench‑v6 and 84.7 on τ²‑Bench, surpassing Claude Sonnet 4.5 on those specific agentic coding benchmarks.【turn4fetch0】【turn1fetch2】

37) HLE (Humanity’s Last Exam) with tools: 42.8% vs 30.4% for GLM‑4.6, showing a big jump in tool‑augmented reasoning capability.【turn1fetch2】

38) On reasoning benchmarks like MMLU‑Pro, GPQA‑Diamond, AIME 2025, HMMT, and IMOAnswerBench, GLM‑4.7 is competitive with top closed models and ahead of many open models.【turn1fetch2】

39) For day‑to‑day coding work, third‑party analyses highlight cleaner structure, fewer silly bugs, and better multilingual output than 4.6, especially on long coding sessions.【turn5fetch1】

40) “Vibe coding” — frontend/UI aesthetics — is significantly improved: layouts, spacing, color consistency, and PPT/poster generation are more polished, which is useful when Floyd generates UI scaffolding.【turn1fetch2】【turn4fetch0】

---

## G. Coding endpoint, Coding Plan, and deployment (41–44)

41) The GLM Coding Plan uses a dedicated coding endpoint `https://api.z.ai/api/coding/paas/v4`, separate from the general endpoint `https://api.z.ai/api/paas/v4`. The coding endpoint is explicitly for coding scenarios and should be used for Floyd’s coding tasks.【turn4fetch1】

42) The coding endpoint is OpenAI‑compatible: you can reuse existing OpenAI SDK/clients just by swapping `base_url`; same tools, same `chat/completions` shape, same function‑calling schema.【turn4fetch1】【turn8click0】

43) GLM‑4.7 is open‑weight under MIT license on Hugging Face, with ~355B total parameters and ~32B active per token; it supports vLLM, SGLang, and Transformers, plus Ollama for local usage.【turn1fetch2】【turn5fetch0】

44) Local deployment needs serious hardware for full precision (e.g., 16× H100 80GB for BF16) but quantized down to 2‑bit it can run on consumer GPUs with enough RAM (~24GB GPU + 128GB system RAM). This matters if Floyd ever runs on‑prem.【turn5fetch0】

---

## H. Structured output, control, and error handling (45–48)

45) GLM‑4.7 supports JSON mode via `response_format: {"type": "json_object"}` plus schema instructions in the system message; this is useful for meta‑prompts, plans, and tool selection decisions.【turn11click0】

46) For agents, combine `response_format="json_object"` with explicit schemas for decisions like: `{"step": string, "tool": string, "args": {...}}`, so the physician can analyze or override Floyd’s plans before execution.【turn11click0】

47) The Function Calling best‑practice docs emphasize robust error handling with structured `{success, error, error_code}` returns, plus strict validation and permission checks on tool implementations. Floyd’s tool layer should adopt this pattern.【turn10fetch0】

48) For security, docs suggest length limits, dangerous‑character filtering, and SQL keyword injection checks on any user‑controlled strings passed to tools. Floyd should never trust raw model output for system commands.【turn10fetch0】

---

## I. Speed, cost, and performance trade‑offs (49–50)

49) On Cerebras hardware, GLM‑4.7 can generate at ~1,000–1,700 tokens/second for coding, making it up to ~10× more price‑performant than Claude Sonnet 4.5 on real workloads; this means fewer latency concerns even with multi‑turn thinking and tools.【turn5fetch1】

50) Because it’s both fast and relatively cheap (roughly 1/7th the cost of top proprietary models per token for coding in some plans), it’s practical to give Floyd more “thinking time” and tools per session than with a closed model, as long as you control per‑turn token budget and preserve thinking blocks effectively.【turn5fetch0】【turn5fetch1】

---

## How Floyd’s physician can actually use these 50 insights

For the physician’s internal logic, some high‑leverage patterns derived directly from the above:

- System prompt template:
  - Start with: role, language rule (“Always respond in English”), and MUST‑level constraints.
  - Then: task‑style rules (“Break tasks into steps”, “Think before each tool”).
  - Then: tool usage policies (minimal, single‑responsibility, explicit error handling).
  - Then: any project‑specific constraints.

- Tool design rules:
  - One tool → one responsibility; name and describe it precisely.
  - Use enums + examples for any parameter that can take limited values.
  - Always return structured `{success, error, error_code, data/timestamp}` from tools.
  - Keep the per‑request tool list small (well below 128 functions) and tailored to the current task.

- Orchestration rules:
  - For heavy coding/agent tasks: enable Preserved Thinking and keep `reasoning_content` intact.
  - For cheap turns: disable thinking entirely to save latency and cost.
  - For long sessions: rely on context caching by keeping system prompts and repeated sections stable.
  - For planning: ask GLM‑4.7 to emit a structured plan in JSON mode; let the physician review it before execution.
