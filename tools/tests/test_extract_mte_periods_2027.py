import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location('periods',Path(__file__).parents[1]/'extract_mte_periods_2027.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class PeriodExtractionTests(unittest.TestCase):
 def test_native_spacing_and_winter_split(self):
  p=m.parse_periods('PERIODO 2A1\nVERANO: DE 8 AG OS T O A 3 0 AG OS T O\nINVIERNO: DE 24 ABRIL A 21 MAY O\nR.M.: 3 1 AG OS T O')
  self.assertEqual(p['vacations'],[{'start':'2027-08-08','end':'2027-08-30'},{'start':'2027-04-24','end':'2027-04-30'}]);self.assertEqual(p['pfa'],[{'start':'2027-05-01','end':'2027-05-21'}]);self.assertEqual(p['medicalRestDate'],'2027-08-31')
 def test_entire_twenty_one_days_is_pfa(self):
  p=m.parse_periods('PERIODO 1A VERANO: DE 16 JUNIO A 15 JULIO INVIERNO: DE 18 NOVIEMBRE A 8 DICIEMBRE R.M.: 15 JUNIO')
  self.assertEqual(len(p['vacations']),1);self.assertEqual(m.days(p['pfa'][0]),21)
 def test_marriage_can_mix_different_summer_winter_groups(self):
  p=m.parse_periods('PERIODO VERANO (2) 8 AGOSTO A 30 AGOSTO PERIODO INVIERNO (4A2) 25 FEBRERO A 24 MARZO R.M.: 25 MARZO',True)
  self.assertEqual(p['summerPeriodCode'],'2');self.assertEqual(p['winterPeriodCode'],'4A2');self.assertEqual(p['pfa'][0]['start'],'2027-03-04');self.assertTrue(p['specialMarriage'])
 def test_january_winter_first_seven_days_are_vacation(self):
  p=m.parse_periods('PERIODO 4B1 VERANO: DE 16 JULIO A 7 AGOSTO INVIERNO: DE 1 ENERO A 28 ENERO R.M.: 29 ENERO')
  self.assertEqual(p['vacations'][1]['end'],'2027-01-07');self.assertEqual(p['pfa'][0]['start'],'2027-01-08')
 def test_unexpected_lengths_and_overlapping_rm_rejected(self):
  with self.assertRaises(ValueError):m.parse_periods('PERIODO 1A VERANO: DE 16 JUNIO A 16 JULIO INVIERNO: DE 18 NOVIEMBRE A 8 DICIEMBRE R.M.: 15 JUNIO')
  with self.assertRaises(ValueError):m.parse_periods('PERIODO 1A VERANO: DE 16 JUNIO A 15 JULIO INVIERNO: DE 18 NOVIEMBRE A 8 DICIEMBRE R.M.: 16 JUNIO')
if __name__=='__main__':unittest.main()
