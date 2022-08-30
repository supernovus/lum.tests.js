module.exports = function (opts={})
{
  let people = 
  [
    {
      name: 'Bob',
      age: 40,
    },
    {
      name: 'Lisa',
      age: 25,
    },
    {
      name: 'Kevin',
      age: 18,
    },
    {
      name: 'Sarah',
      age: 13,
    },
  ];

  if (opts.withRecursion)
  {
    people[0].kids = [people[2],people[3]];
    people[1].kids = [people[3]];
    people[2].kids = [];
    people[3].kids = [];
    people[0].parents = [];
    people[1].parents = [];
    people[2].parents = [people[0]];
    people[3].parents = [people[0],people[1]];
  }
  else if (opts.withReferences)
  {
    people[0].kids = [2,3];
    people[1].kids = [3];
    people[2].kids = [];
    people[3].kids = [];
    people[0].parents = [];
    people[1].parents = [];
    people[2].parents = [0];
    people[3].parents = [0,1];
  }
  else if (opts.withNames)
  {
    people[0].kids = [people[2].name,people[3].name];
    people[1].kids = [people[3].name];
    people[2].kids = [];
    people[3].kids = [];
    people[0].parents = [];
    people[1].parents = [];
    people[2].parents = [people[0].name];
    people[3].parents = [people[0].name,people[1].name];
  }

  return people;
}
