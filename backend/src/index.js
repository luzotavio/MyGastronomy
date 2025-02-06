import express from 'express'
import cors from 'cors'

async function main() {
    const hostname = 'localhost'
    const port = 3000

    const app = express()

    app.use(express.json())
    app.use(cors())

    app.get('/',(req, res) => {
        res.send({
            success: true,
            statusCode: 200,
            body: 'Welcome do Mygasttronomy'          
        })

    })

    app.listen(port, () => {
        console.log(`Server running on: http://${hostname}:${port}`)
    })
}

main()