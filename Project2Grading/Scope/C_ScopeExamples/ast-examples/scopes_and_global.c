struct S
{ // global struct
  int i;
  int j;
} a;          // global a
static int b; // static - still global

int main()
{
  int a; // local a
  {
    struct S
    {
      int i;
    } a; // scoped struct + a (wrapped in statement)
  }
  a++;
}
