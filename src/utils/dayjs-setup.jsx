import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/it';
import 'dayjs/locale/en';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Funzione di utilità per formattare le date con il formato di default
export const formatDate = (date, locale = 'it') => {
    const format = locale === 'it' ? 'DD/MM/YYYY' : 'MM/DD/YYYY';
    return dayjs(date).locale(locale).format(format);
};

export default dayjs;
