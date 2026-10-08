import { Link, useLocation } from 'react-router'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const NotFound = () => {
  const { pathname } = useLocation()
  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 5, textAlign: 'center' }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Page not found
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          There is no page at <code>{pathname}</code>.
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button component={Link} to="/" variant="contained">Go home</Button>
      </CardActions>
    </Card>
  )
}

export default NotFound
