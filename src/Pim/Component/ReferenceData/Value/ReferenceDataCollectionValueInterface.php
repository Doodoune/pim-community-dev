<?php

namespace Pim\Component\ReferenceData\Value;

use Akeneo\Pim\Enrichment\Component\Product\Model\ValueInterface;
use Pim\Component\ReferenceData\Model\ReferenceDataInterface;

/**
 * Product value interface for a collection of reference data
 *
 * @author    Marie Bochu <marie.bochu@akeneo.com>
 * @copyright 2017 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
interface ReferenceDataCollectionValueInterface extends ValueInterface
{
    /**
     * @return ReferenceDataInterface[]
     */
    public function getData();

    /**
     * @return array
     */
    public function getReferenceDataCodes();
}
