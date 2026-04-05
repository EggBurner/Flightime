<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


Create a file named logs.txt.

Whenever you make any change to the codebase — including:

editing code
inserting code
deleting code
creating files
deleting files

add a new log entry to logs.txt.

Logging rules
Start with ID 1
Increment by 1 for each new entry
Never delete or overwrite old logs; always append
Each log must be short but specific enough to identify what changed and where, so the change can be updated or reversed later
Keep descriptions concise to save tokens
never open log.txt in read mode. always use write mode to save tokens