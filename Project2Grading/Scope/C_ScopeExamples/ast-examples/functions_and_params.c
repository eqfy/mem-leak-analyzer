int *func_a(int param1, int *param2); // function with parameters
void func_b(){};                      // function without parameters and statements

int main()
{
  int *a;
  func_a(2, a);
}

int *func_a(int a, int *b_ptr)
{
  func_b();
  return a;
}
