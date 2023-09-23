
FROM golang:1.21

WORKDIR /app

COPY API

RUN go build -o main .

EXPOSE 3001

CMD ["./main"]