// empty struct provides undefined behavior - out of scope

struct A
{
  int i;  // non-struct value
  int *j; // non-struct pointer
};

struct B
{
  struct A *ptr_a; // struct pointer
} b;               // a defined struct variable

struct C
{
  struct B b;      // struct
  struct C *ptr_c; // self-referencing struct pointer
};

int main()
{
  struct C c;
  c.ptr_c->b.ptr_a->i; // access member
}