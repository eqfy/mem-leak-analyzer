int main()
{
  int a = 5;
  int i = 0;
  for (i; i = 5; i++)
  { // expr, <NULL>, expr, expr
    a;
  }

  while (i = 5)
  { // expr
    a;
  }

  do
  {
    a;
  } while (i = 5); // expr
}