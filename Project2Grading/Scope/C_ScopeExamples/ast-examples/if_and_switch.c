int main()
{
  int a = 1;
  if (a + 1)
  { // condition is an expr
    if (a + 2)
    {
      a;
    }
    else
    {
      a;
    }
  }
  else if (a + 3)
  {
    a;
  }
  else
  {
    a;
  }

  switch (a + 1)
  { // condition is an expr + switch waterfall
  case 1:
    a;
  case 2:
    a;
    break;
  default:
    a;
    break;
  case -1:
    a;
  }
}