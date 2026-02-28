FROM node:20-alpine AS web-builder

WORKDIR /app/web
COPY web/package.json web/pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile 2>/dev/null || pnpm install
COPY web/ .
RUN pnpm build

FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o marketplace ./cmd/server

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/marketplace .
COPY --from=web-builder /app/web/build ./web/build
COPY migrations ./migrations

EXPOSE 8090
CMD ["./marketplace"]
