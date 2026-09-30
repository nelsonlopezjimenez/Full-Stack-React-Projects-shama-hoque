import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
// [BEGINNER] Vite turns an image import into its final URL (with a content hash in the
// production build), replacing webpack's file-loader.
import seashellImg from '../assets/images/seashell.jpg'

// [BEGINNER] Styling with the `sx` prop replaces the book's withStyles(styles)(Home) wrapper
// and the `classes` prop. Spacing numbers are theme units: mt: 5 → theme.spacing(5) = 40px
// (the book wrote theme.spacing.unit * 5).
const Home = () => (
  <Card sx={{ maxWidth: 600, mx: 'auto', mt: 5 }}>
    {/* [ADVANCED] Typography variants were renamed in MUI v1 final: headline → h5, title → h6.
        `component="h2"` keeps the right heading level for screen readers. */}
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
