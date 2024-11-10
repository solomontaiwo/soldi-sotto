import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Funzione di utilità per formattare le date con il formato di default
export const formatDate = (date) => {
    return dayjs(date).format('DD/MM/YYYY');
};

export default dayjs;
