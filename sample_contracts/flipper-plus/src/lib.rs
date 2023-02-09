#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod flipper_plus {

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct FlipperPlus {
        /// Stores a single `bool` value on the storage.
        value: bool,
        increment_number: u32,
    }

    impl FlipperPlus {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(init_value: bool, init_number: u32) -> Self {
            Self { value: init_value, increment_number: init_number }
        }

        /// Constructor that initializes the `bool` value to `false`.
        ///
        /// Constructors can delegate to other constructors.
        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new(Default::default(), 0)
        }

        /// A message that can be called on instantiated contracts.
        /// This one flips the value of the stored `bool` from `true`
        /// to `false` and vice versa.
        #[ink(message)]
        pub fn flip(&mut self) -> bool {
            self.value = !self.value;
            self.value
        }

        #[ink(message)]
        pub fn increment(&mut self) {
            self.increment_number += 1;
        }

        /// Simply returns the current value of our `bool`.
        #[ink(message)]
        pub fn get(&self) -> bool {
            self.value
        }

        #[ink(message)]
        pub fn get_number(&self) -> u32 {
            self.increment_number
        }

    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// Imports `ink_lang` so we can use `#[ink::test]`.
        use ink_lang as ink;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let flipper_plus = FlipperPlus::default();
            assert_eq!(flipper_plus.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut flipper_plus = FlipperPlus::new(false, 0);
            assert_eq!(flipper_plus.get(), false);
            flipper_plus.flip();
            assert_eq!(flipper_plus.get(), true);

            assert_eq!(flipper_plus.get_number(), 0);
            flipper_plus.increment();
            assert_eq!(flipper_plus.get_number(), 1);
            flipper_plus.increment();
            assert_eq!(flipper_plus.get_number(), 2);
        }
    }
}
