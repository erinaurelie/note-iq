# DeepSeek R1:7B Local Setup Guide

## Prerequisites

1. **Ollama** installed and running locally
2. **DeepSeek R1:7B model** pulled in Ollama

## Setup Steps

### 1. Install Ollama
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### 2. Pull DeepSeek Model
```bash
ollama pull deepseek-r1:7b
```

### 3. Start Ollama Server
```bash
ollama serve
```

### 4. Environment Variables
Add these to your `.env.local` file:

```env
# DeepSeek Local Model Configuration
DEEPSEEK_BASE_URL="http://localhost:11434"  # Default Ollama URL

# Keep your existing environment variables
DATABASE_URL="your-database-url"
PINECONE_API_KEY="your-pinecone-api-key"
KINDE_CLIENT_ID="your-kinde-client-id"
KINDE_CLIENT_SECRET="your-kinde-client-secret"
KINDE_ISSUER_URL="your-kinde-issuer-url"
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

### 5. Test the Setup
```bash
# Test if Ollama is running
curl http://localhost:11434/api/tags

# Test DeepSeek model
curl -X POST http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1:7b",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": false
  }'
```

## Configuration Options

### Model Parameters
You can adjust the model parameters in `src/lib/deepseek.ts`:

```typescript
export const DEEPSEEK_CONFIG = {
  baseURL: process.env.DEEPSEEK_BASE_URL || 'http://localhost:11434',
  model: 'deepseek-r1:7b',
  temperature: 0.1,        // Lower = more deterministic
  maxTokens: 2048,         // Maximum response length
  topP: 0.9,              // Nucleus sampling
  frequencyPenalty: 0.1,   // Reduce repetition
  presencePenalty: 0.1,    // Encourage new topics
};
```

### Alternative Local Inference Servers

If you're not using Ollama, update the `DEEPSEEK_BASE_URL` to point to your inference server:

- **LM Studio**: `http://localhost:1234`
- **vLLM**: `http://localhost:8000`
- **Custom server**: Your server URL

## Troubleshooting

### Model Not Found
```bash
# Check available models
ollama list

# Pull the model if not present
ollama pull deepseek-r1:7b
```

### Connection Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama if needed
ollama serve
```

### Performance Issues
- Reduce `maxTokens` for faster responses
- Lower `temperature` for more focused answers
- Consider using a smaller model variant

## Benefits of Local DeepSeek

1. **Privacy**: All data stays on your machine
2. **Cost**: No API costs for inference
3. **Speed**: Lower latency for local requests
4. **Customization**: Full control over model parameters
5. **Offline**: Works without internet connection

## Migration from OpenAI

The codebase has been updated to use DeepSeek instead of OpenAI:

- ✅ Chat completions now use DeepSeek R1:7B
- ✅ Embeddings use DeepSeek (for vector search)
- ✅ PDF processing uses DeepSeek embeddings
- ✅ Streaming responses maintained
- ✅ Error handling improved

No changes needed to your frontend code - the API interface remains the same!
