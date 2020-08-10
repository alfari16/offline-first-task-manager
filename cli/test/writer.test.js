const expect = require('chai').expect;
const moment = require('moment');
const writer = require('../dist/writer');

describe('Writer test', () => {
  it('Should render correct table width', () => {
    const col = [10, 6, 21, 1, 40];
    const space = col.length * 3 + 1;
    const total = col.reduce((prev, curr) => prev + curr, 0) + space;

    const table = writer
      .drawTable([], col)
      .split('\n')
      .map((el) => el.length);

    expect(table.join('|')).equal(table.map(() => total).join('|'));
  });

  it('Should render correct task', () => {
    const col = [16, 32, 20, 11, 6];
    const data = [
      {
        createdAt: new Date(),
        tags: ['api', 'tag'],
        content: 'some content',
        isCompleted: false,
        isSync: true,
      },
      {
        createdAt: new Date(),
        tags: [],
        content: 'content without tag',
        isCompleted: true,
        isSync: false,
      },
    ];
    let table = writer
      .drawTable(data, col)
      .split('\n')
      .filter((el) => {
        if (/--------|createdAt/gm.test(el)) return false;
        return true;
      })
      .map((curr) => {
        return curr
          .split('|')
          .map((el) => el.replace(/\s/gm, ''))
          .filter((el) => !!el);
      });
    expect(table).to.deep.equal(
      data
        .map(({ createdAt, content, tags, isSync, isCompleted }) => [
          moment(createdAt).format('YYYY-MM-DDHH:mm'),
          content.replace(/\s/gm, ''),
          tags.join(','),
          isCompleted.toString(),
          isSync.toString(),
        ])
        .map((outer) => outer.filter((el) => !!el))
    );
  });
});
