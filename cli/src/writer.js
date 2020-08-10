import moment from 'moment';

const addSpace = (text, space) => {
  return `${text}${' '.repeat(space)}`.substring(0, space);
};

const drawLine = (col) => {
  return '-'.repeat(col.reduce((prev, curr) => prev + curr + 3, 1));
};

export const drawTable = (data, col) => {
  let result = drawLine(col) + '\n';
  result += `| ${addSpace('createdAt', col[0])} | ${addSpace(
    'content',
    col[1]
  )} | ${addSpace('tags', col[2])} | ${addSpace(
    'isCompleted',
    col[3]
  )} | ${addSpace('isSync', col[4])} |\n`;
  result += drawLine(col) + '\n';
  data.forEach(({ createdAt, content, tags, isCompleted, isSync }) => {
    result +=
      `| ${addSpace(
        moment(createdAt).format('YYYY-MM-DD HH:mm'),
        col[0]
      )} | ${addSpace(content, col[1])} | ${addSpace(
        tags.join(', '),
        col[2]
      )} | ${addSpace(isCompleted.toString(), col[3])} | ${addSpace(
        isSync.toString(),
        col[4]
      )} |` + '\n';
  });
  result += drawLine(col);
  return result;
};
