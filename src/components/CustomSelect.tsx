'use client';

import { Fragment } from 'react'; // React Fragment for grouping elements
import { Listbox, Transition } from '@headlessui/react'; // Headless UI components for accessible select/dropdown
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'; // Up/down arrow icon for the dropdown button
import { CheckIcon } from '@heroicons/react/20/solid'; // Checkmark icon for selected options (assuming this is available)


// Interface to define the structure of an option
interface Option {
  value: string | number;
  label: string;
}

// Interface to define the props for the CustomSelect component
interface CustomSelectProps {
  options: Option[]; // Array of options to display in the dropdown
  value: string | number; // The currently selected value
  onChange: (value: string | number) => void; // Callback function when an option is selected
  label?: string; // Optional label for the select input
  placeholder?: string; // Optional placeholder text when no option is selected
  className?: string; // Additional classes for the outermost div/container
  containerClasses?: string; // Classes applied to the internal container wrapping the button
  selectClasses?: string; // Classes applied directly to the Listbox.Button (the visual select element)
  id?: string; // Optional ID for accessibility
}

// Helper function to conditionally join Tailwind classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function CustomSelect({
  options,
  value,
  onChange,
  label,
  placeholder,
  className,
  containerClasses, // Destructure new prop
  selectClasses,    // Destructure new prop
  id // Destructure new prop
}: CustomSelectProps) {
  // Find the currently selected option object based on its value
  const selectedOption = options.find((option) => option.value === value) || null;

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => ( // 'open' state from Listbox to control dropdown visibility
        <div className={`relative ${className}`}>
          {/* Optional Label */}
          {label && (
            <Listbox.Label htmlFor={id} className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">
              {label}
            </Listbox.Label>
          )}

          {/* Listbox Button (The visible select element) */}
          <Listbox.Button
            id={id} // Apply the ID for accessibility
            className={classNames(
              "relative w-full cursor-default rounded-md bg-white py-3 pr-10 pl-4 text-right shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-base",
              // Adjust icon padding based on RTL/LTR
              "rtl:pr-10 rtl:pl-4",
              "ltr:pl-4 ltr:pr-10",
              containerClasses // Apply classes passed for the container around the button
            )}
          >
            <span className="block truncate">
              {selectedOption ? selectedOption.label : placeholder || 'اختر خيارا...'}
            </span>
            {/* Chevron Up/Down Icon */}
            <span className={classNames(
                "pointer-events-none absolute inset-y-0 flex items-center pr-2",
                "rtl:left-0 rtl:pr-2", // Icon on the left for RTL
                "ltr:right-0 ltr:pl-2"  // Icon on the right for LTR
            )}>
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          {/* Listbox Options (The dropdown menu) */}
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={classNames(
                "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-10 focus:outline-none sm:text-sm",
                selectClasses // Apply classes passed for the actual select element/options container
              )}
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-default select-none py-2 px-4 text-right", // Base styling for options
                      "rtl:pl-10 rtl:pr-4", // Padding for selected checkmark on left for RTL
                      "ltr:pr-10 ltr:pl-4", // Padding for selected checkmark on right for LTR
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900', // Active (hover/focus) state
                      "transition duration-100 ease-in-out" // Smooth transition
                    )
                  }
                  value={option.value}
                >
                  {({ selected, active }) => ( // 'selected' and 'active' states from Headless UI
                    <>
                      <span
                        className={classNames(
                          'block truncate',
                          selected ? 'font-semibold' : 'font-normal' // Bold text for selected option
                        )}
                      >
                        {option.label}
                      </span>
                      {selected ? ( // Show checkmark if option is selected
                        <span
                          className={classNames(
                            "absolute inset-y-0 flex items-center",
                            "rtl:right-0 rtl:pl-3", // Checkmark on the right for RTL
                            "ltr:left-0 ltr:pr-3",  // Checkmark on the left for LTR
                            active ? 'text-blue-600' : 'text-blue-500' // Color checkmark based on active state
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
