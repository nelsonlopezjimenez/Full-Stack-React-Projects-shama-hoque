import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import Template from './../template'
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
import postRoutes from './routes/post.routes'

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import MainRouter from './../client/MainRouter'

import createCache from '@emotion/cache'
import createEmotionServer from '@emotion/server/create-instance'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { teal, orange } from '@mui/material/colors'

import devBundle from './devBundle'

const CURRENT_WORKING_DIR = process.cwd()
const app = express()

devBundle.compile(app)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compress())
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())

app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')))

app.use('/', userRoutes)
app.use('/', authRoutes)
app.use('/', postRoutes)

const theme = createTheme({
  palette: {
    primary: {
      light: '#52c7b8',
      main: '#009688',
      dark: '#00675b',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ffd95b',
      main: '#ffa726',
      dark: '#c77800',
      contrastText: '#000',
    },
    openTitle: teal['700'],
    protectedTitle: orange['700'],
    mode: 'light'
  }
})

app.get('*', (req, res) => {
  const cache = createCache({ key: 'css', prepend: true })
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)

  const context = {}
  const markup = ReactDOMServer.renderToString(
    <CacheProvider value={cache}>
      <StaticRouter location={req.url}>
        <ThemeProvider theme={theme}>
          <MainRouter/>
        </ThemeProvider>
      </StaticRouter>
    </CacheProvider>
  )

  if (context.url) {
    return res.redirect(303, context.url)
  }

  const emotionChunks = extractCriticalToChunks(markup)
  const styles = constructStyleTagsFromChunks(emotionChunks)

  res.status(200).send(Template({ markup, styles }))
})

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: err.name + ': ' + err.message })
  } else {
    next(err)
  }
})

export default app
