import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import seashellImg from '../assets/images/seashell.jpg'

const Home = () => (
  <Card sx={{ maxWidth: 600, mx: 'auto', mt: 5 }}>
    <Typography variant="h6" component="h2" sx={{ px: 2.5, pt: 3, pb: 2, color: 'text.secondary' }}>
      Home Page
    </Typography>
    <CardMedia sx={{ minHeight: 330 }} image={seashellImg} title="Unicorn Shells" />
    <CardContent>
      <Typography variant="body1">
        Welcome to the MERN Skeleton home page.
      </Typography>
    </CardContent>
  </Card>
)

export default Home
