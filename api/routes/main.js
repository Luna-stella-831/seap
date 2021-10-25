
fetch('/api/all')
  .then(response => response.json());
  //.then(data => plotBars(all));

offsetNow = () => {
  now = new Date();
  now.setDate(now.getDate() + calcOffset());
  return now;
}
calcOffset = () => {
  return 365*24  // 1hour
        + 55*24; // for test // should be removed
}

sumPassIds = pds => {
  now = offsetNow();

  ids = Object.keys(pds).some(date => {
    date = new Date(date);
    if(now.getTime() > date.getTime()) {
      return 0;
    }
    return pds[date];
  });

  console.log(ids);
}


plotBars = all => {
  const offset = calcOffset();
  const now = new Date();
  // todo

  Object.keys(all).forEach(testName => {
    sumPassIds(all[testName]);
  });

}


all = {
  'enshud.s2.parser.ParserTest#testNormal18': {
    '2020-09-01T00:00:00.000Z': ['09B99001'],
    '2020-09-01T01:00:00.000Z': ['09B99999', '09B92923']
  }
};

plotBars(all);















