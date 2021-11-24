import formatDate from 'date-fns/format';

const formatTimestamp = (timestamp: Date) => formatDate(timestamp, 'd/M/yy HH:mm:ss');

export default formatTimestamp;
