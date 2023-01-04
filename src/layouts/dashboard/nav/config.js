import SyncIcon from '@mui/icons-material/Sync';
// component
import SvgColor from '../../../components/svg-color';
// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: '同步会话',
    path: '/',
    icon: <SyncIcon sx={{width: 1, height: 1}} />,
  },
];

export default navConfig;
