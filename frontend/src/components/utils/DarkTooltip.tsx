import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

// Шаг 1: Создаём компонент, пробрасывающий className => classes.popper
function CustomTooltip(props: TooltipProps) {
    const { className, ...otherProps } = props;
    return <Tooltip {...otherProps} classes={{ popper: className }} />;
}

// Шаг 2: Оборачиваем CustomTooltip в styled
const DarkTooltip = styled(CustomTooltip)(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.common.black,
        color: '#fff',
        boxShadow: theme.shadows[2],
        fontSize: 15,
    },
}));

export default DarkTooltip;